//Compares and validates password confirmation

const password = document.querySelector("#account_password")
const confirmPassword = document.querySelector("#confirm_password")

confirmPassword.addEventListener("input", function () {

    confirmPassword.setCustomValidity("")

    if (password.value != confirmPassword.value) {
        confirmPassword.setCustomValidity('Enter your password again for confirmation')
    }
})