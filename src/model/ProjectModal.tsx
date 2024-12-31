import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // For validation
import Select from 'react-select'; // Import react-select
import { toast } from 'react-toastify'; // Import toast
import { useProjectContext } from '../context/ProjectContext';
import { baseUrl } from '@/config';

interface Props {
  project?: any;
  onClose: () => void;
}

const ProjectModal: React.FC<Props> = ({ project, onClose }) => {
  const { createProject, updateProject } = useProjectContext();
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`${baseUrl}/users?limit=1000`);
        const data = await response.json();
        setTeamMembers(data?.results || []);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const teamMemberOptions = teamMembers.map((member) => ({
    value: member.id,
    label: member.name,
  }));

  const initialTeamMembers =
    project?.teamMembers?.map((member: { id: string; name: string }) => ({
      value: member.id,
      label: member.name,
    })) || [];

  // Formik configuration
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: project?.name || '',
      description: project?.description || '',
      teamMembers: initialTeamMembers,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Project name is required'),
      description: Yup.string(),
      teamMembers: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .min(1, 'At least one team member is required'),
    }),
    onSubmit: async (values) => {
      const payload = {
        name: values.name,
        description: values.description,
        teamMembers: values.teamMembers.map((member: any) => member.value),
      };
      try {
        if (project) {
          await updateProject(project.id, payload);
          toast.success('Project updated successfully');
        } else {
          await createProject(payload);
          toast.success('Project saved successfully');
        }
        onClose();
      } catch (error) {
        console.error('Error saving project:', error);
        toast.error('Failed to save project');
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl mx-4 sm:mx-auto">
        <h2 className="text-xl font-bold mb-4">{project ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={formik.handleSubmit}>
          <label className="block mb-2 text-left">
            Name:
            <input
              type="text"
              name="name"
              className="w-full border px-2 py-1 rounded"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && typeof formik.errors.name === 'string' && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </label>

          <label className="block mb-2 text-left">
            Team Members:
            <Select
              isMulti
              name="teamMembers"
              options={teamMemberOptions}
              value={formik.values.teamMembers}
              onChange={(selectedOptions) => formik.setFieldValue('teamMembers', selectedOptions)}
              onBlur={formik.handleBlur}
              className="react-select-container"
              classNamePrefix="react-select"
            />
            {formik.touched.teamMembers && formik.errors.teamMembers && (
              <p className="text-red-500 text-sm">{formik.errors.teamMembers as string}</p>
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

export default ProjectModal;
