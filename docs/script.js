function copyPS() {
  const cmd = document.getElementById("psCommand").innerText;
  navigator.clipboard.writeText(cmd);
  alert("PowerShell command copied!");
}