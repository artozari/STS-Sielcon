document.addEventListener("DOMContentLoaded", function () {
    let codeObtained;
    let hashObtained;
    let cutOffId;
    const codeInput1 = document.getElementById("cod1");
    const codeInput2 = document.getElementById("cod2");
    const keyInput = document.getElementById("key");
    const tableNumber = document.getElementById("tableNumber") ? document.getElementById("tableNumber").dataset.tablenumber : null;

    const errorMessage = document.getElementById("errorMessage");

    const showStatusMessage = (message) => {
        if (errorMessage) {
            errorMessage.innerHTML += message;
            errorMessage.classList.add("show");
        }
    };

    const renderEnabledStatus = (data) => {
        if (data.enabled) {
            console.log("Ya existe un corte de caja para fecha:", new Date(data.enabled.time).toLocaleDateString());
            showStatusMessage(" <div style='color: green;'>Ya existe un corte de caja para fecha: " + new Date(data.enabled.time).toLocaleDateString() + ".</div>");
        } else {
            console.log("No hay un corte de caja habilitado actualmente. Asegúrate de habilitar un corte de caja antes de generar un código.");
            showStatusMessage(
                "<br><div style='color: red;'>No hay un corte de caja habilitado actualmente.<br>Asegurate de habilitar un corte de caja para que la maquina este disponible.</div>",
            );
        }
    };

    const renderPendingStatus = (data) => {
        if (data.disabled) {
            console.log("Corte de caja pendiente encontrado:", data.disabled);
            showStatusMessage(
                "<br><div style='color: yellow;'>Corte de caja pendiente encontrado.<br>El corte de caja con id " +
                    data.disabled +
                    " para fecha " +
                    new Date(data.timeDisabled).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }) +
                    " se encuentra pendiente</div>",
            );
        } else {
            console.log("No se encontró un corte de caja pendiente.");
            showStatusMessage(" <br><div style='color: yellow;'>No se encontró un corte de caja pendiente.</div>");
        }
    };

    fetch("/lastCutOff", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.error) {
                renderEnabledStatus(data);
                renderPendingStatus(data);
            }
            if (data.code) {
                cutOffId = data.disabled;
                codeObtained = data.code;
                hashObtained = data.hash;
                codeInput1.value = codeObtained;
                codeInput2.value = String(hashObtained)
                    .slice(-8)
                    .padStart(8, "0")
                    .replace(/(.{4})(.{4})/, "$1-$2");
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
            console.log(response.status);
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
                    body: JSON.stringify({ key: keyInput.value, id: cutOffId, hash: hashObtained, code: codeObtained }),
                });
                const data = await response.json();
                if (data.error) {
                    alert("Error al guardar la clave: " + (data.error || "Error desconocido"));
                } else {
                    location.reload();
                }
            } else {
                alert("El campo de Codigo y Clave no pueden estar vacíos.");
            }
        });
    }
});
