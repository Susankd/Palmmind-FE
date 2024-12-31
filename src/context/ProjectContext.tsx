import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl, getAuthHeaders } from '@/config';

interface Project {
    id: string;
    name: string;
    description: string;
    teamMembers: string[];
    creator?: string;
}

interface ProjectResponse {
    results: Project[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}



interface ProjectContextType {
    projects: ProjectResponse;
    fetchProjects: (page: number, limit: number) => void;
    createProject: (project: Partial<Project>) => Promise<void>;
    updateProject: (id: string, project: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<ProjectResponse>({
        results: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
    });

    // Base URL for the API
    const BASE_URL = `${baseUrl}/project`;

    const fetchProjects = async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}&sortBy=createdAt:desc`, getAuthHeaders());

            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const createProject = async (project: Partial<Project>) => {
        try {
            await axios.post(BASE_URL, project, getAuthHeaders());
            fetchProjects();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const updateProject = async (id: string, project: Partial<Project>) => {
        try {
            await axios.patch(`${BASE_URL}/${id}`, project, getAuthHeaders());
            fetchProjects();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const deleteProject = async (id: string) => {
        try {
            await axios.delete(`${BASE_URL}/${id}`, getAuthHeaders());
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <ProjectContext.Provider value={{ projects, fetchProjects, createProject, updateProject, deleteProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjectContext must be used within a ProjectProvider');
    }
    return context;
};

export const fetchProjects = async () => {
    const response = await axios.get(`${baseUrl}/project?limit=100`);
    return response.data;
};