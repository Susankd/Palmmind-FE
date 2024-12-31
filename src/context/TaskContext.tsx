import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl, getAuthHeaders } from '@/config';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'assigned' | 'active' | 'completed' | 'cancelled';
    assignee: string;
    projectId: string;
}

interface TaskResponse {
    results: Task[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

interface TaskContextType {
    tasks: TaskResponse;
    fetchTasks: (page: number, limit: number, filters: any) => void;
    createTask: (task: Partial<Task>) => Promise<void>;
    updateTask: (id: string, task: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<TaskResponse>({
        results: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
    });

    // Base URL for the API
    const BASE_URL = `${baseUrl}/task`;

    const fetchTasks = async (page = 1, limit = 10, filters: { status?: string; assignee?: string } = {}) => {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy: 'createdAt:desc',
                ...(filters.status && { status: filters.status }),
                ...(filters.assignee && { assignee: filters.assignee }),
            }).toString();

            const response = await axios.get(`${BASE_URL}?${queryParams}`, getAuthHeaders());
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };
    const createTask = async (task: Partial<Task>) => {
        try {
            await axios.post(BASE_URL, task, getAuthHeaders());
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const updateTask = async (id: string, task: Partial<Task>) => {
        try {
            await axios.patch(`${BASE_URL}/${id}`, task, getAuthHeaders());
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`, getAuthHeaders());
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <TaskContext.Provider value={{ tasks, fetchTasks, createTask, updateTask, deleteTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};


export const fetchTasks = async (projectId: string) => {
    const response = await axios.get(`${baseUrl}/task/project/${projectId}`);
    return response.data;
};