function copyCommand() {
  const cmd = "git clone https://github.com/ash-kernel/Zetonic.git";
  navigator.clipboard.writeText(cmd);
  alert("PowerShell command copied!");
}