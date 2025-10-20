document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("formContainer");
  const form = document.getElementById("reservaForm");
  const mensajeExito = document.getElementById("mensajeExito");

  const rutInput = document.getElementById("rut");
  const correoInput = document.getElementById("correo");
  const inputs = form.querySelectorAll("input, select");

  // Validación de RUT chileno
  function validarRUT(rut) {
    rut = rut.replace(/\./g, "").replace(/-/g, "");
    if (rut.length < 8) return false;
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += multiplo * cuerpo[i];
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : dvEsperado.toString();
    return dv === dvCalculado;
  }

  // Validación individual de campos obligatorios
  function validarCampo(input) {
    const errorMsg = input.nextElementSibling;

    if (!input.value.trim()) {
      input.classList.add("error");
      errorMsg.textContent = "Campo obligatorio";
      return false;
    }

    if (input.id === "rut" && !validarRUT(input.value)) {
      input.classList.add("error");
      errorMsg.textContent = "RUT no válido";
      return false;
    }

    if (input.id === "correo") {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(input.value)) {
        input.classList.add("error");
        errorMsg.textContent = "Correo no válido";
        return false;
      }
    }

    input.classList.remove("error");
    errorMsg.textContent = "";
    return true;
  }

  // Validación al salir del campo (blur)
  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validarCampo(input);
    });
  });

  // Validación final al enviar formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valido = true;

    inputs.forEach((input) => {
      if (!validarCampo(input)) valido = false;
    });

    if (!valido) return;

    // Ocultar todo el bloque del formulario (título + subtítulo + form)
    formContainer.classList.add("hidden");

    // Mostrar mensaje de éxito
    mensajeExito.classList.remove("hidden");
  });
});




