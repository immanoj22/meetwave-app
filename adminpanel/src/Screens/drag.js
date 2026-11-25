import React, { useState } from "react";
const generateUsers = () => {
    const names = ["John", "Alice", "Bob", "David", "Emma", "Michael", "Sophia", "Liam", "Olivia", "Noah"];
    const countries = ["USA", "Canada", "UK", "Germany", "France", "Australia", "India", "Japan", "Brazil", "Italy"];
    
    return Array.from({ length: 900 }, (_, i) => ({
      id: i + 1,
      name: names[Math.floor(Math.random() * names.length)],
      age: Math.floor(Math.random() * (50 - 18) + 18), // Random age between 18 and 50
      country: countries[Math.floor(Math.random() * countries.length)]
    }));
  };
const Table = () => {
  const [rows, setRows] = useState(generateUsers());

  const [draggedRowIndex, setDraggedRowIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedRowIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allows drop
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedRowIndex === index) return; // No change if dropped on itself

    const updatedRows = [...rows];
    const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
    updatedRows.splice(index, 0, draggedRow);

    setRows(updatedRows);
    setDraggedRowIndex(null);
  };

  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Country</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr
            key={row.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            style={{ cursor: "grab", background: draggedRowIndex === index ? "#f0f0f0" : "white" }}
          >
            <td>{row.name}</td>
            <td>{row.age}</td>
            <td>{row.country}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;


// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { getHobbieslists } from "../api/api";
// import Task from "./DragAndDrop/HobbiesTaskDrag";
// import { FaTruckMedical } from "react-icons/fa6";
// const generateUsers = () => {
//   const names = ["John", "Alice", "Bob", "David", "Emma", "Michael", "Sophia", "Liam", "Olivia", "Noah"];
//   const countries = ["USA", "Canada", "UK", "Germany", "France", "Australia", "India", "Japan", "Brazil", "Italy"];

//   return Array.from({ length: 900 }, (_, i) => ({
//     id: i + 1,
//     name: names[Math.floor(Math.random() * names.length)],
//     age: Math.floor(Math.random() * (50 - 18) + 18), // Random age between 18 and 50
//     country: countries[Math.floor(Math.random() * countries.length)]
//   }));
// };
// const Table = () => {
//   const [rows, setRows] = useState(generateUsers());

//   const [draggedRowIndex, setDraggedRowIndex] = useState(null);
//   const [hobbieslists, setHobbieslists] = useState([])




//   const handleDragStart = (e, index) => {
//     setDraggedRowIndex(index);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault(); // Allows drop
//   };

//   const handleDrop = (e, index) => {
//     e.preventDefault();
//     if (draggedRowIndex === index) return; // No change if dropped on itself

//     const updatedRows = [...rows];
//     const [draggedRow] = updatedRows.splice(draggedRowIndex, 1);
//     updatedRows.splice(index, 0, draggedRow);

//     setRows(updatedRows);
//     setDraggedRowIndex(null);

//   };

//   return (
//     <table border="1" width="100%">
//       <thead>
//         <tr>
//           <th>S.No</th>

//           <th>Category</th>
//           <th>Subcategory</th>
//           <th>Hobby Name</th>
//           <th>Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {rows.map((records, index) => (
//           <Task
//             index={index}
//             key={records._id}
//             records={records}
//             GetgetHobbieslists={GetgetHobbieslists}
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//           />
//         )
//         )}
//       </tbody>
//     </table>
//   );
// };

// export default Table;
