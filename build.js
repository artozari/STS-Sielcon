const { build } = require("esbuild");
const fs = require("fs");

async function generarBuild() {
    try {
        await build({
            entryPoints: ["app.js"],
            bundle: true,
            platform: "node",
            target: "node18",
            outfile: "dist/app.js",
            minify: true,
            pure: ["console.log"],

            // LA SOLUCIÓN: Esto le dice a esbuild que ignore TODO lo que está en node_modules
            // y deje los require() intactos en el código final.
            packages: "external",
        });

        // Copiamos las carpetas estáticas
        fs.cpSync("./views", "./dist/views", { recursive: true, force: true });
        fs.cpSync("./public", "./dist/public", { recursive: true, force: true });

        // Copiamos configuraciones necesarias
        fs.cpSync("./package.json", "./dist/package.json");

        console.log("¡Build generado con éxito en la carpeta /dist! 🚀");
    } catch (error) {
        console.error("Error al generar el build:", error);
        process.exit(1);
    }
}

generarBuild();
