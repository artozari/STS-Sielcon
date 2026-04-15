// Controlador del menú hamburguesa
document.addEventListener("DOMContentLoaded", function () {
    const hamburguer = document.getElementById("hamburguer");
    const menuList = document.getElementById("menu-list");

    if (hamburguer && menuList) {
        hamburguer.addEventListener("click", () => {
            hamburguer.classList.toggle("active");
            menuList.classList.toggle("show");
        });
    }
});

// Manejar el formulario de máquina
document.addEventListener("DOMContentLoaded", function () {
    const machineForm = document.getElementById("machineForm");

    if (machineForm) {
        machineForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const machineId = document.getElementById("machineId").value;
            const action = document.getElementById("action").value;
            const loadingDiv = document.getElementById("loading");
            const successAlert = document.getElementById("successAlert");
            const errorAlert = document.getElementById("errorAlert");
            const successMessage = document.getElementById("successMessage");
            const errorMessage = document.getElementById("errorMessage");

            // Ocultar alertas previas
            successAlert.classList.remove("show");
            errorAlert.classList.remove("show");

            // Mostrar loading
            loadingDiv.style.display = "block";

            try {
                const response = await fetch("/api/habilitar-maquina", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        machineId: parseInt(machineId),
                        action: action,
                    }),
                });

                const data = await response.json();

                loadingDiv.style.display = "none";

                if (data.success) {
                    successMessage.textContent = data.message;
                    successAlert.classList.add("show");
                    machineForm.reset();

                    // Auto-ocultar el mensaje después de 5 segundos
                    setTimeout(() => {
                        successAlert.classList.remove("show");
                    }, 5000);
                } else {
                    errorMessage.textContent = data.message;
                    errorAlert.classList.add("show");
                }
            } catch (error) {
                loadingDiv.style.display = "none";
                errorMessage.textContent = error.message;
                errorAlert.classList.add("show");
                console.error("Error:", error);
            }
        });
    }
});
