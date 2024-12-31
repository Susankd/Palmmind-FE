import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // For validation
import { useSearchParams, useNavigate } from 'react-router-dom'; // For navigation and query params
import { toast } from 'react-toastify'; // For notifications
import axios from 'axios';
import { baseUrl } from '@/config';

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  // Extract `email` and `role` from the query parameters
  const email = searchParams.get('email');
  const role = searchParams.get('role');

  useEffect(() => {
    if (!email || !role) {
      toast.error('Invalid invitation link.');
    }
  }, [email, role]);

  const formik = useFormik({
    initialValues: {
      name: '',
      password: '',
      email: email || '',
      role: role || '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters long')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // API call to approve the invitation
        await axios.post(`${baseUrl}/inviteUser/approve`, values);
        toast.success('Invitation accepted successfully!');
        setIsSubmitting(false);

        // Navigate to login page after success
        navigate('/login');
      } catch (error) {
        console.error('Error accepting invitation:', error);
        toast.error('Failed to accept invitation. Please try again.');
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4 text-center">Accept Invitation</h2>
        <form onSubmit={formik.handleSubmit}>
          <label className="block mb-2 text-left">
            Email:
            <input
              type="text"
              name="email"
              value={formik.values.email}
              disabled
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </label>

          <label className="block mb-2 text-left">
            Role:
            <input
              type="text"
              name="role"
              value={formik.values.role}
              disabled
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </label>

          <label className="block mb-2 text-left">
            Name:
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border px-2 py-1 rounded"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm">{formik.errors.name}</p>
            )}
          </label>

          <label className="block mb-2 text-left">
            Password:
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border px-2 py-1 rounded"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
          </label>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={isSubmitting || !formik.isValid || !formik.dirty}
            >
              {isSubmitting ? 'Submitting...' : 'Accept Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
