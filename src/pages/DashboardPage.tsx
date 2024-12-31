// components/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { fetchProjects } from "../context/ProjectContext";
import { fetchTasks } from "../context/TaskContext";
import { useAuth } from "@/context/AuthContext";

interface TeamMember {
    id: string;
    name: string;
}

interface Task {
    id: string;
    title: string;
    status: string;
}

interface TaskList {
    data: Task[];
}

interface Project {
    id: string;
    name: string;
    description: string;
    teamMembers: TeamMember[];
    tasks: TaskList;
}

const DashboardPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const loadProjects = async () => {
            setLoading(true);
            try {
                const projectData = await fetchProjects();

                const projectsWithTasks = await Promise.all(
                    projectData?.results?.map(async (project: Project) => {
                        const tasks = await fetchTasks(project.id);
                        return { ...project, tasks: tasks };
                    })
                );

                setProjects(projectsWithTasks);
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setLoading(false);
            }
        };

        loadProjects();
    }, []);


    const toggleExpandProject = (projectId: string) => {
        setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "assigned":
                return "text-blue-600"; // Blue for 'assigned'
            case "active":
                return "text-green-600"; // Green for 'active'
            case "completed":
                return "text-gray-600"; // Gray for 'completed'
            case "cancelled":
                return "text-red-600"; // Red for 'cancelled'
            default:
                return "text-black"; // Default color
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            {isAuthenticated ? (<>
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg shadow-lg p-6 bg-white">
                            <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
                            <p className="text-gray-600 mb-4">{project.description}</p>

                            {project.teamMembers?.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-700">Team Members:</h3>
                                    <ul className="list-disc list-inside text-gray-600">
                                        {project.teamMembers.map((member) => (
                                            <li key={member.id}>{member.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {project?.tasks?.data?.length > 0 && (
                                <div className="mt-4">
                                    <h3
                                        className="font-semibold text-gray-700 cursor-pointer"
                                        onClick={() => toggleExpandProject(project.id)}
                                    >
                                        Tasks ({project.tasks.data.length}) -{" "}
                                        {project.tasks.data.filter((task) => task.status === "completed").length} Completed
                                    </h3>
                                    {expandedProjectId === project.id && (
                                        <ul className="list-none mt-2">
                                            {project.tasks.data.map((task) => (
                                                <li
                                                    key={task.id}
                                                    className="flex justify-between items-center p-2 border-b hover:bg-gray-100"
                                                >
                                                    <span>{task.title}</span>
                                                    <span className={`${getStatusColor(task.status)} font-semibold`}>
                                                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No projects available. Start by creating a new project!
                    </div>
                )}
            </>) : <p>Please login to view the Dashbaord.</p>}

        </div>
    );
};

export default DashboardPage;
