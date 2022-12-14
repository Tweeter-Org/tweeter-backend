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

module.exports = {
    validatepass,
    validatemail
}