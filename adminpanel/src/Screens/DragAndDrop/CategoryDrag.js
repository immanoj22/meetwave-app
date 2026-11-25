import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit } from 'react-icons/fa';
import { adminAddcategory } from "../../api/api";
import { useState } from "react";
import toast from 'react-hot-toast';
import EditCategory from "../../Modals/EditCategory";

const CategoryDrag = ({ index, records, GetCategogylists, onDragStart, onDragOver, onDrop }) => {
  console.log("rectototototo", records);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showcategory, setShowcategory] = useState({})
  const handleCloseEditCategory = () => {
    setShowEditCategory(false)
  }
  const handleShowEditCategory = (record) => {
    console.log("records", record);
    setShowEditCategory(true)
    setShowcategory(record)
  }

  const hideshowchange = async (filter, record) => {
    console.log("reecoredsa", filter, record);

    try {

      let payload = {
        id: record,
        hideshow: filter,
        type: "hide"
      }
      let resp = await adminAddcategory(payload)
      console.log("responses", resp);
      if (resp.status) {
        toast.success(resp.message)
      }
      else {
        toast.error(resp.message)

      }
      GetCategogylists()
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
      <EditCategory show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetCategogylists} />

      <tr 
      ref={setNodeRef} 
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      // style={style}
      >
        <td {...attributes} {...listeners}>{index + 1}</td>
        <td {...attributes} {...listeners}>{records?.category || "-"}</td>
        <td {...attributes} {...listeners}><p className={`${records?.hideshow === "visible" ? "green_text" : "red_text"}`}>{records?.hideshow}</p></td>
        <td className="custom_toggle custom_toggle_secondary">
          <label className="switch">
            <input
              checked={records.hideshow == "hidden" ? false : true}
              type="checkbox" onChange={() => hideshowchange(records.hideshow == "visible" ? "hidden" : "visible", records._id)}
            />
            <span className="slider round"></span>
            </label>
          </td>
        <td className="drag-table__actions">
        

          <button className='green_edit_button'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Delete button clicked");
              handleShowEditCategory(records);
            }}
          >
            <FaEdit className='ms-1' />
          </button>

        </td>
      </tr >
    </>);
};

export default CategoryDrag;
