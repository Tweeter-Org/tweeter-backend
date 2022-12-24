function validatepass(password){
    let pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    result = pattern.test(password);
    return result;
}

function validatemail(email){
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    result = mailformat.test(email);
    return result;
}

function validateusername(user_name){
    let userformat = /^[a-zA-Z0-9.\-_$@*!]{3,30}$/;
    result = userformat.test(user_name);
    return result;
}

module.exports = {
    validatepass,
    validatemail,
    validateusername
}