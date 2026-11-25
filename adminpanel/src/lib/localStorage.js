export const getAuthToken = () => {
    if (localStorage.getItem('token')) {
        return localStorage.getItem('token')
    } else {sessionStorage.getItem('token')}
    return '';
}

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
        sessionStorage.setItem("token", token);

    }
}


export const logoutUser = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    setAuthToken(false);
};
