// profileImages.js
const profileImagePath = [
  'Images/mountain1.jpeg',
  'Images/mountain2.jpeg',
  'Images/mountain3.jpg',
  'Images/mountain4.jpeg',
  'Images/mountain5.png',
  'Images/mountain6.jpeg',
  'Images/mountain7.jpg',
  'Images/nature1.png',
  'Images/sea1.jpg',
  'Images/sea2.jpg',
];



export default profileImagePath;


export const randomimages = [
  require("../Assets/logo/Profile1.png"),
  require("../Assets/logo/Profile2.png"),
  require("../Assets/logo/Profile3.png"),
  require("../Assets/logo/Profile4.png"),
  require("../Assets/logo/Profile5.png"),
  require("../Assets/logo/Profile6.png"),
  require("../Assets/logo/Profile7.png"),
  require("../Assets/logo/Profile8.png"),
  require("../Assets/logo/Profile9.png"),
  require("../Assets/logo/Profile10.png"),
  require("../Assets/logo/Profile11.png"),
  require("../Assets/logo/Profile12.png"),
  require("../Assets/logo/Profile13.png"),
  require("../Assets/logo/Profile14.png"),
  require("../Assets/logo/Profile15.png"),
]


export const localrandomindex = () => {
  var array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  return Math.floor(Math.random() * array.length);

}

