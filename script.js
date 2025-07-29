function pular() {
  const url = document.getElementById("link").value.trim();
  if (!url) return alert("Cola o link, chefia!");

  // Redirecionamento direto
  window.location.href = url;
}
