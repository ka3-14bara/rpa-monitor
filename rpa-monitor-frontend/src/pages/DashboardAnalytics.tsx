import { useState, useEffect } from "react";
import { errorsApi, dashboardApi } from "../services/api";
import type { DashboardDataDto } from "../types";
import { useNotifications } from "../contexts/NotificationContext";
import Layout from "../components/Layout";
import {
    PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function DashboardAnalytics() {
    const [allProjects, setAllProjects] = useState<string[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7); // 7 дней назад
        return d.toISOString().slice(0, 16);
    });
    const [to, setTo] = useState(() => new Date().toISOString().slice(0, 16));
    const [data, setData] = useState<DashboardDataDto | null>(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const { addNotification } = useNotifications();

    useEffect(() => {
        errorsApi.getProjects().then(setAllProjects).catch(() => addNotification("Ошибка загрузки проектов", "error"));
    }, []);

    // 1. При маунте грузим ВСЕ проекты + сохранённые проекты юзера
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const [available, userProj] = await Promise.all([
                    errorsApi.getProjects(),
                    errorsApi.getUserProjects()
                ]);
                setAllProjects(available || []);
                setSelectedProjects(userProj || []); // ← предвыбираем то, что юзер уже отслеживает
            } catch (err) {
                addNotification("Ошибка загрузки проектов", "error");
            }
        };
        loadProjects();
    }, []);

    // 2. Авто-генерация при изменении выбранных проектов или дат
    useEffect(() => {
        if (selectedProjects.length > 0 && from && to) {
            handleGenerate();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProjects, from, to]); // ← было [allProjects, from, to]

    const filteredProjects = allProjects.filter(
        (p) => !selectedProjects.includes(p) && p.toLowerCase().includes(search.toLowerCase())
    );

    const toggleProject = (p: string) => {
        setSelectedProjects((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    };

    const handleGenerate = async () => {
        if (selectedProjects.length === 0 || !from || !to) {
            addNotification("Выберите проекты и период", "warning");
            return;
        }
        setLoading(true);
        try {
            const res = await dashboardApi.getData({ projects: selectedProjects, from, to });
            setData(res);
            addNotification("Дашборд сформирован", "success");
        } catch (err: any) {
            addNotification(err.message || "Ошибка загрузки данных", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (selectedProjects.length === 0 || !from || !to) {
            addNotification("Выберите проекты и период", "warning");
            return;
        }
        try {
            await dashboardApi.exportExcel({ projects: selectedProjects, from, to });
            addNotification("Отчет скачан", "success");
        } catch (err: any) {
            addNotification(err.message || "Ошибка экспорта", "error");
        }
    };

    const pieData = data ? Object.entries(data.errorsByProject).map(([name, value]) => ({ name, value })) : [];
    const sourcePieData = data ? Object.entries(data.errorsBySource).map(([name, value]) => ({ name, value })) : [];

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Аналитика ошибок</h1>

                {/* Фильтры */}
                <section className="bg-gray-800 p-5 rounded-xl border border-gray-700 space-y-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        {/* Выбор проектов */}
                        <div className="flex-1 min-w-[250px] relative">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Проекты</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {selectedProjects.map((p) => (
                                    <button key={p} onClick={() => toggleProject(p)} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">
                                        {p} ×
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Поиск проектов..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                                onFocus={() => setIsOpen(true)}
                                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                            {isOpen && search && (
                                <div className="absolute z-10 w-full mt-1 max-h-40 overflow-auto bg-gray-700 border border-gray-600 rounded-lg shadow-xl">
                                    {filteredProjects.length > 0 ? filteredProjects.map((p) => (
                                        <button key={p} onClick={() => { toggleProject(p); setSearch(""); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600">
                                            {p}
                                        </button>
                                    )) : <div className="px-3 py-2 text-sm text-gray-400">Ничего не найдено</div>}
                                </div>
                            )}
                        </div>

                        {/* Период */}
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-400">С</label>
                            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-400">По</label>
                            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500" />
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-2">
                            <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                                {loading ? "Загрузка..." : "Сформировать"}
                            </button>
                            <button onClick={handleExport} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Excel
                            </button>
                        </div>
                    </div>
                </section>

                {/* Результат */}
                {data && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                            <span className="text-gray-400">Всего ошибок за период:</span>
                            <span className="text-2xl font-bold text-white">{data.totalErrors}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Круговая по проектам */}
                            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">Ошибки по проектам</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Круговая по источникам */}
                            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-300 mb-4">Ошибки по источникам</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={sourcePieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#3b82f6" />
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* График по времени */}
                        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Динамика ошибок по дням</h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={data.errorsOverTime}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }} />
                                    <Legend wrapperStyle={{ color: "#d1d5db" }} />
                                    <Line type="monotone" dataKey="rpaCount" name="RPA" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="jenkinsCount" name="Jenkins" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}