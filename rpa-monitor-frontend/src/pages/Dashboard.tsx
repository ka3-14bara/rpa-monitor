import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorsApi } from "../services/api";
import type { LastErrorDto } from "../types";
import { useNotifications } from "../contexts/NotificationContext";
import Layout from "../components/Layout";

// ... (импорты те же)

export default function Dashboard() {
  const [lastErrors, setLastErrors] = useState<LastErrorDto[]>([]);
  const [allProjects, setAllProjects] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [errors, available, userProj] = await Promise.all([
          errorsApi.getLastErrors(),
          errorsApi.getProjects(),
          errorsApi.getUserProjects(), // GET /api/errors/user/projects
        ]);

        setLastErrors(errors || []);
        setAllProjects(available || []);
        setSelectedProjects(userProj || []);
      } catch (err) {
        addNotification("Ошибка загрузки данных", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = allProjects.filter(
    (p) =>
      !selectedProjects.includes(p) &&
      p.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleProject = async (project: string) => {
    const newList = selectedProjects.includes(project)
      ? selectedProjects.filter((p) => p !== project)
      : [...selectedProjects, project];

    setSaving(true);
    try {
      // Пытаемся сохранить на бэкенд
      await errorsApi.saveUserProjects(newList);
      // Если запрос прошел (даже если вернул пустой body, но статус 200)
      setSelectedProjects(newList);
      addNotification("Список обновлен", "success");
    } catch (err: any) {
      // Если при 200 OK вылетает ошибка, проверьте, не пытается ли ваш API-клиент
      // парсить пустой ответ как JSON.
      console.error("Save error:", err);
      addNotification("Ошибка сохранения конфигурации", "error");
    } finally {
      setSaving(false);
    }
  };

  // ИСПРАВЛЕНИЕ ОТОБРАЖЕНИЯ: Приводим ключи к единому виду (trim и lowercase)
  const errorsMap = new Map(
    lastErrors.map((e) => {
      // Используем projectNumber вместо project
      const key = e.projectNumber
        ? String(e.projectNumber).trim().toLowerCase()
        : "unknown";
      return [key, e];
    }),
  );

  if (loading)
    return (
      <Layout>
        <div className="p-10 text-center text-white">Загрузка...</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Выбор проектов */}
        <section className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Настроить список мониторинга:
          </h3>

          {/* 1. Область выбранных проектов (Таблетки) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedProjects.map((p) => (
                  <button
                    key={p}
                    disabled={saving}
                    onClick={() => handleToggleProject(p)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-700"
                  >
                    {p}
                    <span className="text-blue-200 group-hover:text-white">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Поле поиска и Dropdown */}
          <div className="relative  w-full">
            <input
              type="text"
              placeholder="Поиск проектов..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
            />

            {isOpen && search.length > 0 && (
              <div className="absolute z-10 w-full mt-2 max-h-60 overflow-auto bg-gray-700 border border-gray-600 rounded-lg shadow-xl">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        handleToggleProject(p);
                        setSearch("");
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                    >
                      {p}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-400">
                    Ничего не найдено
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedProjects.map((projectName) => {
            // Ищем в мапе по нормализованному ключу
            const isReaded = errorsMap.get(
              String(projectName).trim().toLowerCase(),
            )?.isRead;
            const error = errorsMap.get(
              String(projectName).trim().toLowerCase(),
            );

            return (
              <div
                key={projectName}
                onClick={() =>
                  navigate(`/project/${encodeURIComponent(projectName)}`)
                }
                className="bg-gray-800 border border-gray-700 p-5 rounded-xl hover:border-blue-500 cursor-pointer transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-bold group-hover:text-blue-400">
                    {projectName}
                  </h4>
                  <span
                    className={`w-2 h-2 rounded-full ${!isReaded ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                  />
                </div>

                <div className="space-y-2">
                  {isReaded && (
                    <p className="text-sm text-gray-500 italic">
                      Ошибок нет. Последняя ошибка:
                    </p>
                  )}
                  {!isReaded && (
                    <p className="text-sm text-gray-500 italic">
                      Последняя ошибка:
                    </p>
                  )}
                  <div
                    style={{ overflowY: "auto", minHeight: "100px" }}
                    className={`text-sm line-clamp-2 font-mono ${!isReaded ? "bg-red-900/20  text-red-300" : "bg-green-900/20  text-green-300"} p-2 rounded`}
                  >
                    {error?.message}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {new Date(error?.createdAt || "").toLocaleString("ru-RU")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
