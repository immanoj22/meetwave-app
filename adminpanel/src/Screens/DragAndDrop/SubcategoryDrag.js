import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit } from 'react-icons/fa';
import { FaPlus, FaTrash } from "react-icons/fa6";
import { adminAddsubcategory } from "../../api/api";
import toast from 'react-hot-toast';

const SubcategoryDrag = ({ index, records, Getsubcategorylistdata, onEdit, onDragStart, onDragOver, onDrop}) => {
   const hideshowchange = async (filter, record) => {
        console.log("reecorewdsa", filter, record);

        try {

            let payload = {
                id: record,
                hideshow: filter,
                type: "hide"
            }
            let resp = await adminAddsubcategory(payload)
            console.log("responses", resp);
            if (resp.status) {
                toast.success(resp.message)
            }
            else {
                toast.error(resp.message)

            }
            Getsubcategorylistdata()
        } catch (error) {
            console.log("errror", error);
        }
    }

  const id = records?._id
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <>
      <tr
        ref={setNodeRef}
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      >
        <td {...attributes} {...listeners}>{index + 1}</td>
        <td {...attributes} {...listeners}>{records?.categoryId?.category || "-"}</td>
        <td {...attributes} {...listeners}>{records?.subcategory || "-"}</td>
        <td {...attributes} {...listeners} className="text-center w_100">
          <div className="custom_toggle custom_toggle_secondary">
            <label className="switch">
              <input
                checked={records?.hideshow !== "hidden"}
                type="checkbox"
                onChange={() =>
                  hideshowchange(
                    records?.hideshow === "visible" ? "hidden" : "visible",
                    records?._id
                  )
                }
              />
              <span className="slider round"></span>
            </label>
          </div>
        </td>
        <td className="drag-table__actions">


          <button className='green_edit_button'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Delete button clicked");
              onEdit(records);
            }}
          >
            <FaEdit className='ms-1' />
          </button>

        </td>
      </tr >
    </>);
};

export default SubcategoryDrag;
