/**
 * QZ Tray Security Configuration
 * 
 * Este arquivo configura a segurança do QZ Tray para impressão térmica.
 * Ele carrega o certificado demo e configura a assinatura criptográfica.
 * 
 * Certificado: Demo do QZ Tray (autoassinado)
 * Algoritmo: SHA512withRSA
 * 
 * IMPORTANTE: Para remover a mensagem "Invalid Certificate", configure:
 * 1. Arquivo: C:\Users\[USUARIO]\.qz\qz-tray.properties
 * 2. Adicione: security.allow-untrusted=true
 * 3. Reinicie o QZ Tray
 */

// ============================================================================
// CERTIFICADO DEMO DO QZ TRAY
// ============================================================================

var CERTIFICATE = "-----BEGIN CERTIFICATE-----\n" +
"MIIECzCCAvOgAwIBAgIGAZsi+vUCMA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG\n" +
"EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS\n" +
"UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx\n" +
"HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg\n" +
"RGVtbyBDZXJ0MB4XDTI1MTIxNDE3MDcxMFoXDTQ1MTIxNDE3MDcxMFowgaIxCzAJ\n" +
"BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD\n" +
"VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs\n" +
"IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog\n" +
"VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDc\n" +
"6ybJL7VZqGl/nRI416S7RQSIUXObt1ZiQABP0q4Dj2Pjge2qFWbPluvswMzD2L9T\n" +
"ds2ZvzN85McYpnAirdh+hSql3wP5tkiKm9ksNsoF+/1Wmb92J1vVGzuR/nYxMYHA\n" +
"rqbg8yoOrHH5tLtQ1/bgHiuIn/vFDe9/zF0AGGLXhPNWu13xMA3HZFqP1E3yEM8j\n" +
"9lxHPHgBKYU72V8zB10/3xK4z71QqEr8hvp3ThnoQND7IYadv9zNs4hDBK9gRIw5\n" +
"azAwu3Hd0b8dL7hGNKQ0QqQzPdQj2whP0msEu8Ou3xdV7nu7AuWwtQauuor7TqVi\n" +
"aq5coFTKMIiIxo+DxggHAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD\n" +
"VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBS6rhZYtfCNMS7+sm8o6UVOv33wpTANBgkq\n" +
"hkiG9w0BAQsFAAOCAQEANVvG7rqpGP0PmHBd55p9y2Ev6bFsC8s7s690EJtkf1oS\n" +
"A2M/MUyQ37bll3JOOWcEl3bNxmWEAeXAic6hL6IRo0To2IWNqnlmMEY2/ZVMLz7+\n" +
"ZH7d7YwPGfHqMaiRd+xYYcVwjGpiq6i2g2NxKGZGzjLpLV52mwirU4TnMERWPfwq\n" +
"vDp9ekNczTJdnEY+lrDB02bMHIqCBTdzSMeqDuSBR7aRB59OSaJx9BqPwlnupMmF\n" +
"GgCMsMLU/eTTdAFK8kaPGNyD6lr4ZnxVhdDx82+PqGOQpkUEMCXmM9QdR2F3p1VI\n" +
"tBudQa+VL9M+SHsMpF0Wu6zIs2IwXkc5pWa2P1+NmA==\n" +
"-----END CERTIFICATE-----";

// Chave privada demo do QZ Tray
var PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n" +
"MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDc6ybJL7VZqGl/\n" +
"nRI416S7RQSIUXObt1ZiQABP0q4Dj2Pjge2qFWbPluvswMzD2L9Tds2ZvzN85McY\n" +
"pnAirdh+hSql3wP5tkiKm9ksNsoF+/1Wmb92J1vVGzuR/nYxMYHArqbg8yoOrHH5\n" +
"tLtQ1/bgHiuIn/vFDe9/zF0AGGLXhPNWu13xMA3HZFqP1E3yEM8j9lxHPHgBKYU7\n" +
"2V8zB10/3xK4z71QqEr8hvp3ThnoQND7IYadv9zNs4hDBK9gRIw5azAwu3Hd0b8d\n" +
"L7hGNKQ0QqQzPdQj2whP0msEu8Ou3xdV7nu7AuWwtQauuor7TqViaq5coFTKMIiI\n" +
"xo+DxggHAgMBAAECggEAUU3r6tw3koU0Ooact7XJhzBp8B+F/DeXv7YNR1NivqWt\n" +
"ngPp65BP07OYJXx5f9SL6ZROK7jeIqdyDMTofSLdDAdHgF9Y77Sh8v1Tin2pkVVB\n" +
"0fboq3vlxMLuhBcR+Z3eQoMkoKJthpP5qGxXCfRJhAcmf3RdrRKpY6/bRFc1PVqe\n" +
"QqM90WPvqY/B4X8Dns6wJu33n1MXQzUgFhAJDI7xO1nLDNl/tndTOUIiqFtSVQSU\n" +
"3CzYnVu7Lotelet36XoujJj8rhnLvdfTwycAHbVqGSeR9xN61CibXABCfWoKxPzI\n" +
"wKuovsxjZCvsGCjPj4otjWs6iTQ0XFUFFwC6bBO4YQKBgQDwu7V76F8EEEffllPI\n" +
"Et5IuADTbN+0d0UUYjcpIjnKqLPUJoJ0DNqhIoOziLC8lqWmH1xFg68S1JSnNX8l\n" +
"JZBGnOXhopX9CASZMyr9RYNFVebN0gc5U1eho0iOezb0K8gMqoVPqMm0bmpbS5tW\n" +
"bkttB3ZReUjUdJq3E3ibMk8I5wKBgQDq7cCbZehce1s2xdh/6KaoF8IoaEx3IyAP\n" +
"ko6RsvSqYNYmMKYg5UQEIx3x9/MktjBbRqegyIFdLxHzOdVxTEusJgcVmb9aZmSG\n" +
"zXbqmSDRVoAExshnCJTa9TRrmrPE/PfJZ9rUxIYGGj9qf63r8Xr/AKN5tI20lJhu\n" +
"FgrHwheD4QKBgElQcWHuD9nV932hc5yQGoA9AYtiMfLtC+28R55QXRdaL4IhxEMB\n" +
"kyfVshRgQar9mi8wh9Jn2065zRfrU/CFMx4+NEh2UoWABp59lc8Sd3sLQUJXf3m2\n" +
"5w5EAxnZbpAIMWGiIP10oxE/O0bYjNNSvcfTqPYBIOwLIv80f9uMA8PrAoGAB+lP\n" +
"xivtYkfpL3QEMXKFQj3ilPfGM3DkYIHf+TockSxHqeuTfKIb40PHe2GNN5xHDpvX\n" +
"g0udR6URJq646GLYXYi+TlTqI8I0+nEq4wWbHFGcaAzFrOqWELWXOVRxX13hfk/Y\n" +
"B7hChywVHKIGGl78dF/yIWQaLY2fgH2PiWCY6CECgYASw3HDPyliZcyO0qSQeOoW\n" +
"pmoGtisweCzk3R7LRqH7Ks5Ryte8iQjjwBSbsqcgZ8nRKNA2enYl/7PKOcIoDmol\n" +
"E2gRf/DtZy5T4DO3pwt1Pu8b3h61j68WQOlCuElN8+5zMC2PNtE+4RNySBguMR3R\n" +
"7BTtXSZfl22EmLDwsZAUrg==\n" +
"-----END PRIVATE KEY-----";

// Configurar assinatura usando jsrsasign
qz.security.setCertificatePromise(function(resolve, reject) {
    resolve(CERTIFICATE);
});

qz.security.setSignatureAlgorithm("SHA512");

qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(PRIVATE_KEY);
            var sig = new KJUR.crypto.Signature({"alg": "SHA512withRSA"});
            sig.init(pk);
            sig.updateString(toSign);
            var hex = sig.sign();
            resolve(stob64(hextorstr(hex)));
        } catch (err) {
            console.error("Erro ao assinar:", err);
            reject(err);
        }
    };
});

// Função auxiliar para converter hex para base64
function stob64(s) {
    return hextob64(rstrtohex(s));
}

function rstrtohex(s) {
    var result = "";
    for (var i = 0; i < s.length; i++) {
        result += ("0" + s.charCodeAt(i).toString(16)).slice(-2);
    }
    return result;
}
