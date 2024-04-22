import {chromium} from "playwright";

const currentUrl = "https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp";
const nextUrl = "https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:83.0) Gecko/20100101 Firefox/83.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
];


async function openWebPage(numRuc) {
    console.log("Entrando al scrap")
    let browser = null;
    const currentUserAgent = Math.floor(Math.random() * userAgents.length);
    try {

        browser = await chromium.launch({
            headless: true
        });
        console.log("cargo el navegador")
        
        const page = await browser.newPage({
            userAgent:userAgents[currentUserAgent]
        });
        console.log(userAgents[currentUserAgent])
        
        await page.goto(currentUrl, {timeout: 60000});
        console.log("llego hasta la conexion con el link");
        
        //Movimiento mas humano
        await page.click("h1");
        await page.click("#btnPorDocumento");
        await page.click("#btnPorRuc");
        await page.click("#txtRuc");
        await page.fill("#txtRuc", numRuc.substring(0, 3));
        await page.waitForTimeout(1000);
        await page.keyboard.press("Control+Delete");
        await page.fill("#txtRuc", numRuc);
        await page.click("#btnAceptar");
        console.log("se hizo click")
        await page.waitForURL(nextUrl);
        console.log("Espero a la url");

        const result = await page.evaluate(async () => {
            const $ = query => document.querySelector(query);
            const error = $(".cuerpo") && $(".error");
            if(error) return {
                error: `Parece que el sitio de la SUNAT ha tenido un error. Probablemente ha detectado el scarping.
                        El error que presenta es ${$(".error").textContent}`
            }

            const element = document.querySelector(".list-group");;
            const childrens = element?.children;

            const obtenerTexto = (childrens, childIndex) => {
                return childrens.children[0].children[childIndex].children[0].innerText.trim();
            }

            const campos = [
                { nombre: 'numeroRucName', indice: 1, elementoIndice: 0 },
                { nombre: 'tipoContribuyente', indice: 1, elementoIndice: 1 },
                { nombre: 'nombreComercial', indice: 1, elementoIndice: 2 },
                { nombre: 'fechaInscripcion', indice: 1, elementoIndice: 3 },
                { nombre: 'estadoContribuyente', indice: 1, elementoIndice: 4 },
                { nombre: 'condicionContribuyente', indice: 1, elementoIndice: 5 },
                { nombre: 'domicilioFiscal', indice: 1, elementoIndice: 6 },
                { nombre: 'sistemaEmisionComprobante', indice: 1, elementoIndice: 7 },
                { nombre: 'actividadComercio', indice: 3, elementoIndice: 7 },
                { nombre: 'sistemaContabilidad', indice: 1, elementoIndice: 8 },
                { nombre: 'emisorElectronicoDesde', indice: 1, elementoIndice: 12 },
                { nombre: 'comprobanteElectronico', indice: 1, elementoIndice: 13 },
                { nombre: 'afiliadoAlPleDesde', indice: 1, elementoIndice: 14 }
            ];

            const resultado = {};

            campos.forEach((campo) => {
                resultado[campo.nombre] = obtenerTexto(childrens[campo.elementoIndice], campo.indice);
            });

            return resultado;

        })


        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await browser.close();

    }
}

export { openWebPage };




         