document.addEventListener("DOMContentLoaded", function () {
    let codeObtained;
    let hashObtained;
    let cutOffId;
    const codeInput1 = document.getElementById("cod1");
    const codeInput2 = document.getElementById("cod2");
    const keyInput = document.getElementById("key");

    const errorMessage = document.getElementById("errorMessage");

    fetch("/lastCutOff", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                if (data.enabled) {
                    console.log("Ya existe un corte de caja para fecha:", new Date(data.enabled.time).toLocaleDateString());
                    if (errorMessage) {
                        errorMessage.innerHTML += " <div style='color: green;'>Ya existe un corte de caja para fecha: " + new Date(data.enabled.time).toLocaleDateString() + ".</div>";
                        errorMessage.classList.add("show");
                    }
                } else {
                    console.log("No hay un corte de caja habilitado actualmente. Asegúrate de habilitar un corte de caja antes de generar un código.");
                    if (errorMessage) {
                        errorMessage.innerHTML += "<br><div style='color: red;'>No hay un corte de caja habilitado actualmente.<br>Asegurate de habilitar un corte de caja para que la maquina este disponible.</div>";
                        errorMessage.classList.add("show");
                    }
                }
                if (!data.disabled) {
                    console.log("No se encontró un corte de caja pendiente.");
                    if (errorMessage) {
                        errorMessage.innerHTML += " <br><div style='color: yellow;'>No se encontró un corte de caja pendiente.</div>";
                        errorMessage.classList.add("show");
                    }
                } else {
                    console.log("Corte de caja pendiente encontrado:", data.disabled);
                    if (errorMessage) {
                        errorMessage.innerHTML += "<br><div style='color: yellow;'>Corte de caja pendiente encontrado.<br>El corte de caja con id " + data.disabled + " se encuentra pendiente</div>";
                        errorMessage.classList.add("show");
                    }
                }
            }
            if (data.code) {
                cutOffId = data.disabled;
                codeObtained = data.code;
                hashObtained = data.hash;
                codeInput1.value = codeObtained;
                codeInput2.value = hashObtained;
            }
        });

    const hamburguer = document.getElementById("hamburguer");
    const menuList = document.getElementById("menu-list");

    if (hamburguer && menuList) {
        hamburguer.addEventListener("click", () => {
            hamburguer.classList.toggle("active");
            menuList.classList.toggle("show");
        });
    }

    const machineForm = document.getElementById("generateCodeBtn");
    const saveKeyBtn = document.getElementById("saveKey");

    if (machineForm) {
        machineForm.addEventListener("click", async (e) => {
            e.preventDefault();
            const response = await fetch("/generateCode", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            const data = await response.json();
            location.reload();
        });
    }
    if (saveKeyBtn) {
        saveKeyBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (keyInput.value.trim() && cutOffId) {
                const response = await fetch("/addKey", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ key: keyInput.value, id: cutOffId, hash: hashObtained }),
                });
                const data = await response.json();
                if (data.error) {
                    alert("Error al guardar la clave: " + (data.message || "Error desconocido"));
                } else {
                    location.reload();
                }
            } else {
                alert("El campo de Codigo y Clave no pueden estar vacíos.");
            }
        });
    }
});
