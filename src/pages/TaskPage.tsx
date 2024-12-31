import React, { useMemo, useState } from "react";
import { useTable, usePagination } from "react-table";
import { useTaskContext } from "../context/TaskContext";
import TaskModal from "../model/TaskModel";
import { toast } from "react-toastify";

const TaskPage: React.FC = () => {
  const { tasks, deleteTask, fetchTasks } = useTaskContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: "",
    assignee: "",
  });

  const user = localStorage.getItem("user");
  const jsonUser = JSON.parse(user || "");

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      toast.success("Task deleted successfully");
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handlePageChange = (pageIndex: number) => {
    const limit = pagination.limit;
    fetchTasks(pageIndex + 1, limit, filters); // Pass filters with the fetch request
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchTasks(1, pagination.limit, filters); // Fetch tasks based on filters
  };

  const columns = useMemo(
    () => [
      {
        Header: "Title",
        accessor: "title",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Assignee",
        accessor: "assignee",
        Cell: ({ value }: any) => (value ? value.name : "None"),
      },
      {
        Header: "Project",
        accessor: "projectId",
        Cell: ({ value }: any) => (value ? value.name : "None"),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }: any) => {
          let textColor = "";
          switch (value.toLowerCase()) {
            case "assigned":
              textColor = "text-blue-600";
              break;
            case "active":
              textColor = "text-green-600";
              break;
            case "completed":
              textColor = "text-gray-600";
              break;
            case "cancelled":
              textColor = "text-red-600";
              break;
            default:
              textColor = "text-black";
              break;
          }
          return (
            <span className={`${textColor} font-semibold`}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </span>
          );
        },
      },
      {
        Header: "Actions",
        Cell: ({ row }: any) => (
          <div>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded mr-2"
              onClick={() => {
                setEditingTask(row.original);
                setModalOpen(true);
              }}
            >
              Edit
            </button>
            {jsonUser?.role === "superadmin" && (
              <button
                className="px-2 py-1 bg-red-600 text-white rounded"
                onClick={() => setConfirmDeleteId(row.original.id)}
              >
                Delete
              </button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const data = useMemo(() => tasks?.results || [], [tasks]);
  const pagination = useMemo(
    () => ({
      currentPage: tasks?.page || 1,
      totalPages: tasks?.totalPages || 0,
      limit: tasks?.limit || 10,
    }),
    [tasks]
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
      initialState: { pageIndex: pagination.currentPage - 1 },
      manualPagination: true,
      pageCount: pagination.totalPages,
    },
    usePagination
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Task List</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }}
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Status</option>
          <option value="assigned">Assigned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          name="assignee"
          placeholder="Search by Assignee"
          value={filters.assignee}
          onChange={handleFilterChange}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Apply Filters
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
              fetchTasks(pagination.currentPage, newLimit, filters);
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
        <TaskModal
          task={editingTask}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this task?</p>
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

export default TaskPage;
