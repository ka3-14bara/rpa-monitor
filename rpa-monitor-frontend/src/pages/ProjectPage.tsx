import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { errorsApi } from "../services/api";
import type { RpaError, JenkinsError } from "../types";
import { useNotifications } from "../contexts/NotificationContext";
import Layout from "../components/Layout";

type ErrorType = "rpa" | "jenkins";

export default function ProjectPage() {
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ErrorType>("rpa");
  const [errors, setErrors] = useState<(RpaError | JenkinsError)[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    from: "",
    to: "",
  });
  const { addNotification } = useNotifications();

  const fetchErrors = async (page = pagination.page) => {
    if (!projectName) return;
    setLoading(true);
    try {
      const params = {
        project: projectName,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        size: pagination.size,
      };
      let response;
      if (activeTab === "rpa") {
        response = await errorsApi.getRpaErrors(params);
      } else {
        response = await errorsApi.getJenkinsErrors(params);
      }
      setErrors(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (err: any) {
      addNotification("Ошибка загрузки ошибок", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors(0);
    // eslint-disable-next-line
  }, [activeTab, projectName, filters.from, filters.to]);

  const handleMarkRead = async (id: number) => {
    try {
      if (activeTab === "rpa") {
        await errorsApi.markRpaRead(id);
      } else {
        await errorsApi.markJenkinsRead(id);
      }
      addNotification("Отмечено как прочитанное", "success");
      // Обновляем список
      fetchErrors(pagination.page);
    } catch (err) {
      addNotification("Ошибка обновления", "error");
    }
  };

  const handleMarkAllRead = async () => {
    if (!projectName) return;
    try {
      if (activeTab === "rpa") {
        await errorsApi.markAllRpaByProject(projectName);
      } else {
        await errorsApi.markAllJenkinsByProject(projectName);
      }
      addNotification("Все ошибки отмечены как прочитанные", "success");
      fetchErrors(pagination.page);
    } catch (err) {
      addNotification("Ошибка обновления", "error");
    }
  };

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (delta: number) => {
    const newPage = pagination.page + delta;
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchErrors(newPage);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU");
  };

  return (
    <Layout>
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 md:p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">
          Project: {projectName}
        </h2>

        {/* Вкладки */}
        <div className="flex space-x-2 border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab("rpa")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "rpa"
                ? "bg-red-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            RPA ошибки
          </button>
          <button
            onClick={() => setActiveTab("jenkins")}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === "jenkins"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Jenkins ошибки
          </button>
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(e) => handleFilterChange("from", e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => handleFilterChange("to", e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
          />
          <button
            onClick={() => fetchErrors(0)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            Применить
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm"
          >
            Прочитать все
          </button>
        </div>

        {/* Список ошибок */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="loading-spinner w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Нет ошибок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {errors.map((error: any) => (
              <div
                key={error.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 p-1">
                  <div className="flex-1 min-w-0">
                    {" "}
                    {/* min-w-0 лечит баги с break-words в flex */}
                    {/* Хедер карточки: Теги и Статус */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs rounded-full font-semibold uppercase tracking-wider ${
                          activeTab === "rpa"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {activeTab}
                      </span>

                      <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-700/50 rounded-full">
                        <span
                          className={`w-2 h-2 rounded-full ${!error.isRead ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                        />
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          {!error.isRead ? "Активно" : "Просмотрено"}
                        </span>
                      </div>

                      {!error.isRead && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase border border-yellow-500/20 rounded animate-pulse">
                          New
                        </span>
                      )}
                    </div>
                    {/* Основной контент: Текст ошибки */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-tight">
                        Текст ошибки
                      </h4>
                      <p className="text-white text-base leading-relaxed break-words text-left bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                        {error.exMessage || error.message}
                      </p>
                    </div>
                    {/* Сетка технических данных */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-5">
                      {[
                        { label: "Этап", value: error.stage },
                        { label: "Activity", value: error.activityName },
                        { label: "Type", value: error.activityType },
                        { label: "Component ID", value: error.componentId },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col border-l-2 border-gray-700 pl-3"
                        >
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                            {item.label}
                          </span>
                          <span
                            className="text-gray-300 text-sm truncate"
                            title={item.value}
                          >
                            {item.value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Футер карточки: Мета-данные */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] font-medium text-gray-500 border-t border-gray-700/50 pt-3">
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {formatDate(error.createdAt)}
                      </div>
                      {error.exType && (
                        <span className="bg-gray-700/30 px-2 py-0.5 rounded">
                          Код: {error.exType}
                        </span>
                      )}
                      <span>
                        Повторов:{" "}
                        <b className="text-gray-300">{error.triesCount}</b>
                      </span>
                      <span className="truncate max-w-[150px]">
                        💻 {error.computerName}
                      </span>
                    </div>
                  </div>

                  {/* Кнопка действия */}
                  {!error.isRead && (
                    <button
                      onClick={() => handleMarkRead(error.id)}
                      className="w-full lg:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-3 lg:py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Прочитано
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Страница {pagination.page + 1} из {pagination.totalPages} (всего:{" "}
              {pagination.totalElements})
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(-1)}
                disabled={pagination.page === 0}
                className={`px-4 py-2 rounded-lg transition-all ${
                  pagination.page === 0
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                ← Назад
              </button>
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.page >= pagination.totalPages - 1}
                className={`px-4 py-2 rounded-lg transition-all ${
                  pagination.page >= pagination.totalPages - 1
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Вперед →
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
