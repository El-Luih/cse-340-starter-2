const form = document.querySelector("#account-details-form")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("#details-submit")
      updateBtn.removeAttribute("disabled")
    })