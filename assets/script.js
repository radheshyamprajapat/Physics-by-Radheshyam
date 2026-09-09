
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
if(menuBtn){
  menuBtn.addEventListener("click",()=>navLinks.classList.toggle("open"));
}
document.querySelectorAll(".nav-links a").forEach(a=>{
  a.addEventListener("click",()=>navLinks.classList.remove("open"));
});
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());

const search = document.querySelector("#resourceSearch");
if(search){
  search.addEventListener("input",()=>{
    const q=search.value.toLowerCase().trim();
    document.querySelectorAll("[data-searchable]").forEach(card=>{
      card.style.display=card.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}
