// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import toast from 'react-hot-toast';
export function toastAlert(errorType, message
) {

    if (errorType === 'error') {
        toast.error(message)
        // toast.error(message, {
        //     autoClose: 2000,
        //     toastId: id,
        //     position: toast.POSITION[position],
        // });

    } else if (errorType === 'success') {
        toast.success(message)
        // toast.success(message, {
        //     autoClose: 2000,
        //     toastId: id,
        //     position: toast.POSITION[position],
        // });
    }
}