### Astuce Google Colab (Contre la déconnexion automatique)
Si vous devez laisser Colab tourner toute la nuit, le système vous déconnectera après 90 minutes d'inactivité de la souris. 
Pour empêcher cela, appuyez sur `F12` dans Chrome/Safari pour ouvrir la Console Développeur, collez ce code JavaScript et appuyez sur Entrée :

```javascript
function ConnectButton(){
    console.log("Connect pushed"); 
    document.querySelector("#top-toolbar > colab-connect-button").shadowRoot.querySelector("#connect").click() 
}
setInterval(ConnectButton,60000);
```
