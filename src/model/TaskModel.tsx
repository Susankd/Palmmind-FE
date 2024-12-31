import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // For validation
import Select from 'react-select'; // Import react-select
import { toast } from 'react-toastify'; // Import toast
import { useTaskContext } from '../context/TaskContext';
import { baseUrl } from '@/config';

interface Props {
  task?: any;
  onClose: () => void;
}

const TaskModal: React.FC<Props> = ({ task, onClose }) => {
  const { createTask, updateTask } = useTaskContext();
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseUrl}/users?limit=1000`);
        const data = await response.json();
        setUsers(data?.results || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${baseUrl}/project?limit=1000`);
        const data = await response.json();
        setProjects(data?.results || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchUsers();
    fetchProjects();
  }, []);

  // Map users and projects for react-select options
  const userOptions = users.map((user) => ({ value: user.id, label: user.name }));
  const projectOptions = projects.map((project) => ({ value: project.id, label: project.name }));

  // Prepare initial values for editing
  const initialAssignee = task?.assignee ? { value: task.assignee.id, label: task.assignee.name } : null;
  const initialProject = task?.projectId ? { value: task.projectId.id, label: task.projectId.name } : null;

  // Formik configuration
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'assigned',
      assignee: initialAssignee,
      projectId: initialProject,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Task title is required'),
      description: Yup.string(),
      status: Yup.string()
        .oneOf(['assigned', 'active', 'completed', 'cancelled'])
        .when('task', {
          is: Boolean(task),
          then: (schema) => schema.required('Status is required'),
        }),
      assignee: Yup.object()
        .shape({ value: Yup.string().required(), label: Yup.string().required() })
        .required('Assignee is required'),
      projectId: Yup.object()
        .shape({ value: Yup.string().required(), label: Yup.string().required() })
        .required('Project is required'),
    }),
    onSubmit: async (values) => {
      const payload = {
        title: values.title,
        description: values.description,
        status: task ? values.status : 'assigned',
        assignee: values.assignee.value,
        projectId: values.projectId.value,
      };
      try {
        if (task) {
          await updateTask(task.id, payload);
          toast.success('Task updated successfully');
        } else {
          await createTask(payload);
          toast.success('Task created successfully');
        }
        onClose();
      } catch (error) {
        console.error('Error saving task:', error);
        toast.error('Failed to save task');
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl mx-4 sm:mx-auto">
        <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={formik.handleSubmit}>
          <label className="block mb-2 text-left">
            Title:
            <input
              type="text"
              name="title"
              className="w-full border px-2 py-1 rounded"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.title && typeof formik.errors.title === 'string' && (
              <p className="text-red-500 text-sm">{formik.errors.title}</p>
            )}
          </label>

          {task && (
            <label className="block mb-2 text-left">
              Status:
              <select
                name="status"
                className="w-full border px-2 py-1 rounded"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="assigned">Assigned</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formik.touched.status && typeof formik.errors.status === 'string' && (
                <p className="text-red-500 text-sm">{formik.errors.status}</p>
              )}
            </label>
          )}

          <label className="block mb-2 text-left">
            Assignee:
            <Select
              name="assignee"
              options={userOptions}
              value={formik.values.assignee}
              onChange={(selectedOption) => formik.setFieldValue('assignee', selectedOption)}
              onBlur={formik.handleBlur}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {formik.touched.assignee && formik.errors.assignee && (
              <p className="text-red-500 text-sm">{formik.errors.assignee as string}</p>
            )}
          </label>

          <label className="block mb-2 text-left">
            Project:
            <Select
              name="projectId"
              options={projectOptions}
              value={formik.values.projectId}
              onChange={(selectedOption) => formik.setFieldValue('projectId', selectedOption)}
              onBlur={formik.handleBlur}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {formik.touched.projectId && formik.errors.projectId && (
              <p className="text-red-500 text-sm">{formik.errors.projectId as string}</p>
            )}
          </label>

          <label className="block mb-2 text-left">
            Description:
            <textarea
              name="description"
              className="w-full border px-2 py-1 rounded"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && typeof formik.errors.description === 'string' && (
              <p className="text-red-500 text-sm">{formik.errors.description}</p>
            )}
          </label>

          <div className="flex justify-end mt-4">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded mr-2" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
