import React, { useMemo, useState } from "react";
import { useTable, usePagination } from "react-table";
import { useProjectContext } from "../context/ProjectContext";
import ProjectModal from "../model/ProjectModal";
import { toast } from "react-toastify";

const ProjectPage: React.FC = () => {
  const { projects, deleteProject, fetchProjects } = useProjectContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const user = localStorage.getItem("user");
  const jsonUser = JSON.parse(user || "");

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success("Project deleted successfully"); // Show success message
      setConfirmDeleteId(null); // Close the confirmation popup
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project"); // Show error message
    }
  };

  const handlePageChange = (pageIndex: number) => {
    const limit = pagination.limit; // Use the current limit from the pagination state
    fetchProjects(pageIndex + 1, limit); // Pass both page and limit
  };

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Team Members",
        accessor: "teamMembers",
        Cell: ({ value }: any) =>
          value && value.length
            ? value.map((member: { name: string }) => member.name).join(", ")
            : "None",
      },
      {
        Header: "Actions",
        Cell: ({ row }: any) => (
          <div>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded mr-2"
              onClick={() => {
                setEditingProject(row.original);
                setModalOpen(true);
              }}
            >
              Edit
            </button>
            {jsonUser?.role === "superadmin" ? (
              <button
                className="px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => setConfirmDeleteId(row.original.id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => projects?.results || [], [projects]);
  const pagination = useMemo(
    () => ({
      currentPage: projects?.page || 1,
      totalPages: projects?.totalPages || 0,
      limit: projects?.limit || 10,
    }),
    [projects]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: pagination.currentPage - 1 }, // Set initial page
      manualPagination: true, // Pagination handled manually via context
      pageCount: pagination.totalPages,
    },
    usePagination
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h1 className="text-xl font-bold">Project List: </h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
        >
          Create Project
        </button>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="table-auto w-full bg-white shadow rounded min-w-[600px]"
        >
          <thead>
            {headerGroups.map((headerGroup: any) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column: any) => (
                  <th
                    {...column.getHeaderProps()}
                    className="px-4 py-2 border bg-gray-100 text-left"
                    key={column.id}
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row: any) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell: any) => (
                    <td
                      {...cell.getCellProps()}
                      className="border px-4 py-2"
                      key={cell.column.id}
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
        <div>
          <button
            onClick={() => handlePageChange(0)}
            disabled={pagination.currentPage === 1}
            className="px-2 py-1 border rounded mr-2"
          >
            {"<<"}
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 2)}
            disabled={pagination.currentPage === 1}
            className="px-2 py-1 border rounded mr-2"
          >
            {"<"}
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-2 py-1 border rounded mr-2"
          >
            {">"}
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages - 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-2 py-1 border rounded"
          >
            {">>"}
          </button>
        </div>
        <div>
          Page{" "}
          <strong>
            {pagination.currentPage} of {pagination.totalPages}
          </strong>
        </div>
        <div>
          <select
            value={pagination.limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              fetchProjects(pagination.currentPage, newLimit);
            }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this project?</p>
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded mr-2"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
