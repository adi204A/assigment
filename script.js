
window.dataLayer = window.dataLayer || [];


const form = document.getElementById("consultationForm");

form.addEventListener("submit", function (e) {

    e.preventDefault();


    const patientName=document.getElementById("name").value;

const patientPhone=document.getElementById("phone").value;

const clinic = document.getElementById("clinic").value;



     window.dataLayer.push({
    

   event:"consultation_form_submitted",

    patient_name:patientName,

    phone_number:patientPhone,
    clinic:clinic

    });

    console.log(window.dataLayer);

   form.innerHTML=`

<div class="success-message">

<h2>

✅ Consultation Booked

</h2>

<p>

Thank you ${patientName}.

</p>

<p>

Our Orthopaedic Team will call you within 30 minutes.

</p>

</div>

`;

});