export const generateCode = (value) => {
    let code = "";
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(" ")
        .forEach((item) => {
            code += item.charAt(1) + item.charAt(0);
        });
    return code.toUpperCase() + value.length;
};
