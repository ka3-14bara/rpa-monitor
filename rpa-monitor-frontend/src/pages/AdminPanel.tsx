import { useState, useEffect } from "react";
import { adminApi } from "../services/api"; // путь к вашему api.ts
import type { UserDto } from "../types";

export function AdminPanel() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ROLE_USER",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    try {
      await adminApi.createUser(form);
      setShowForm(false);
      setForm({ username: "", password: "", role: "ROLE_USER" });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Ошибка создания пользователя");
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await adminApi.updateUserRole(id, newRole);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Ошибка обновления роли");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Удалить этого пользователя?")) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Ошибка удаления");
    }
  };

  if (loading) return <div className="p-6 text-center">Загрузка...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Заголовок и кнопка призыва к действию */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Управление доступом
          </h1>
          <p className="text-sm text-gray-400">
            Всего пользователей: {users.length}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            showForm
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
          }`}
        >
          {showForm ? (
            <>
              <span>×</span> Отмена
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Создать пользователя
            </>
          )}
        </button>
      </div>

      {/* Форма создания (анимированная) */}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-2xl border border-blue-500/30 animate-slide-in shadow-2xl">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
            Новый аккаунт
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Логин"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Пароль"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-blue-500 outline-none transition-all appearance-none"
              >
                <option value="ROLE_USER">User (Доступ к логам)</option>
                <option value="ROLE_ADMIN">Admin (Полный доступ)</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
            >
              Подтвердить
            </button>
          </form>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  ID
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Пользователь
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Права доступа
                </th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">
                  Управление
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-gray-700/30 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-mono text-gray-500 text-sm">
                      #{user.id}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-200 font-medium">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className={`text-xs font-bold py-1 px-2 rounded-lg bg-gray-900 border transition-all outline-none ${
                        user.role === "ROLE_ADMIN"
                          ? "text-purple-400 border-purple-500/30"
                          : "text-blue-400 border-blue-500/30"
                      }`}
                    >
                      <option value="ROLE_USER">USER</option>
                      <option value="ROLE_ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Удалить пользователя"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 mb-4">
              <svg
                className="w-8 h-8 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">
              Список пуст. Добавьте первого администратора.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
