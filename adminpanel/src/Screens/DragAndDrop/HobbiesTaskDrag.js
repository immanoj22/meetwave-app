// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { FaEdit } from 'react-icons/fa';
// import { FaPlus, FaTrash } from "react-icons/fa6";
// import { adminAddHobbies, getHobbieslists } from "../../api/api";
// import { useState } from "react";
// import EditHobbies from "../../Modals/EditHobbies";
// import toast from 'react-hot-toast';


// // import "./Task.css";

// const Task = ({ index, records, hobbylists, GetgetHobbieslists }) => {
//   console.log("hobbbyyb_recordss",records);

//   const [showEditCategory, setShowEditCategory] = useState(false);
//   const [showcategory, setShowcategory] = useState({})

// console.log("sdffffff",showEditCategory,showcategory);

//   const handleCloseEditCategory = () => {
//     setShowEditCategory(false)
//   }
//   const handleShowEditCategory = (record) => {
//     console.log("records", record);
//     setShowEditCategory(true)
//     setShowcategory(record)
//   }

//   const id = records?._id
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id });

//   const style = {
//     transition,
//     transform: CSS.Transform.toString(transform),
//   };
//   const DeleteFunc = async (record) => {
//     console.log("recoreds", record)
//     try {
//       let confirm = window.confirm("Are you sure to delete?")
//       if (confirm) {
//         let payload = {
//           type: "delete",
//           id: record?._id
//         }
//         let resp = await adminAddHobbies(payload)
//         console.log("ersponses", resp)
//         if (resp) {
//           toast.success(resp.message)
//           GetgetHobbieslists()

//         }
//         else {
//           toast.error(resp.message)

//         }
//       }
//       // else {
//       //   toast.success("Cancelled delete")
//       // }
//     } catch (e) {
//       console("error_DeleteFunc", e)
//     }
//   }
//   return (
//     <>
//     {
//       showEditCategory
//       ?
//       <>
//     <EditHobbies show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetgetHobbieslists} />
//       </>
//       :
//       <></>
//     }

//       <tr 
//       ref={setNodeRef} style={style}
//       >
//         <td {...attributes} {...listeners}>{index + 1}</td>
//         <td {...attributes} {...listeners}>{records?.categorylist?.[0]?.category || "-"}</td>
//         <td {...attributes} {...listeners}>{records?.subcategorylist?.[0]?.subcategory || "-"}</td>
//         <td {...attributes} {...listeners}>{records?.hobbyname}</td>

//         {/* <td {...attributes} {...listeners}>{records?.plan}</td> */}
//         <td className="drag-table__actions">
//           <button className='green_edit_button'
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               console.log("Delete button clicked");
//               handleShowEditCategory(records);
//             }}
//           >
//             <FaEdit className='ms-1' />
//           </button>
//           <button className='delete_button'
//             onClick={(e) => {
//               e.stopPropagation();
//               e.preventDefault();
//               console.log("Delete button clicked");
//               DeleteFunc(records);
//             }}
//           >
//             <FaTrash />
//           </button>
//         </td>
//       </tr >
//     </>);
// };

// export default Task;

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit } from 'react-icons/fa';
import { FaPlus, FaTrash } from "react-icons/fa6";
import { adminAddHobbies, getHobbieslists } from "../../api/api";
import { useState } from "react";
import EditHobbies from "../../Modals/EditHobbies";
import toast from 'react-hot-toast';
import HobbiesTrash from "../../Modals/HobbiesTrash";


// import "./Task.css";

const Task = ({ index, records, hobbylists, GetgetHobbieslists, onDragStart, onDragOver, onDrop }) => {
  console.log("hobbbyyb_recordss", records);

  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showTrashCategory, setShowTrashCategory] = useState(false);
  const [showcategory, setShowcategory] = useState({})

  console.log("sdffffff", showEditCategory, showcategory);

  const handleCloseEditCategory = () => {
    setShowEditCategory(false)
  }
  const handleShowEditCategory = (record) => {
    console.log("records", record);
    setShowEditCategory(true)
    setShowcategory(record)
  }

  const id = records?._id
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const handleCloseShowTrash = () => {
    setShowTrashCategory(false)
  }
  const DeleteFunc = async (record) => {
    console.log("recoreds", record)
    try {
      let confirm = window.confirm("Are you sure to delete?")
      if (confirm) {
        let payload = {
          type: "delete",
          id: record?._id
        }
        let resp = await adminAddHobbies(payload)
        console.log("ersponses", resp)
        if (resp) {
          toast.success(resp.message)
          GetgetHobbieslists()
        }
        else {
          toast.error(resp.message)
        }
      }
      else {
        toast.success("Cancelled delete")
      }
    } catch (e) {
      console("error_DeleteFunc", e)
    }
  }
  return (
    <>
      {
        showEditCategory
          ?
          <>
            <EditHobbies show={showEditCategory} handleClose={handleCloseEditCategory} EditData={showcategory} editfunc={GetgetHobbieslists} />
          </>
          :
          <></>
      }
      {
        showTrashCategory 
          ?
          <>
            <HobbiesTrash show={showTrashCategory} handleClose={handleCloseShowTrash}  />
          </>
          :
          <></>
      }

      <tr
        ref={setNodeRef}
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      // style={style}
      >
        <td {...attributes} {...listeners}>{index + 1}</td>
        <td {...attributes} {...listeners}>{records?.categorylist?.[0]?.category || "-"}</td>
        <td {...attributes} {...listeners}>{records?.subcategorylist?.[0]?.subcategory || "-"}</td>
        <td {...attributes} {...listeners}>{records?.hobbyname}</td>

        {/* <td {...attributes} {...listeners}>{records?.plan}</td> */}
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
          <button className='delete_button'
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("Delete button clicked");
              DeleteFunc(records);
            }}
          >
            <FaTrash />
          </button>
        </td>
      </tr >
    </>);
};

export default Task;
