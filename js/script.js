
/* Kun maavalinnat loppuvat, tulostetaan yhteenveto matkasuunnitelmasta.
*/
function naytaYhteenveto() {

    // Poistetaan tapahtumankuuntelijat, jotta suunnitelmaa ei voi palata muuttamaan.
    window.addEventListener("click", function (event) {
        event.stopPropagation();
    }, true);
    
    let nayta = document.getElementById("tier" + kierros);
    
    let yhteenveto = document.createElement("div");
    yhteenveto.setAttribute("id", "yhteenveto");
    yhteenveto.classList.add("card");
    yhteenveto.innerHTML = '<div class="card-body"><h2 class="card-title">Travel plan summary</h2>'
        + '<p class="card-text"><strong>Name of traveller: </strong>' + matkustajaNimi + '</p>'
        + '<p class="card-text"><strong>Number of countries to visit: </strong>' 
        + valitutMaat.length + '</p><p class="card-text"><strong>Estimated time of travel: </strong>'
        + valitutMaat.length * 3 + ' days.</p>';
    nayta.appendChild(yhteenveto);

}

/* Jos käyttäjä on klikannut jo korostetusta maasta,
 * poistetaan sen maan korostus. Jälleen tutkitaan, mitä elementtiä
 * käyttäjä kortin sisällä klikkasi, jotta voidaan poistaa korostus.
 */
function poistaValinta(klikattu) {
    
    if (klikattu.nodeName === "DIV") {
        klikattu.classList.remove("korostus");
    }
    else if (klikattu.nodeName === "P") {
        klikattu.parentNode.classList.remove("korostus");
    }
    else if (klikattu.nodeName === "H5") {
        klikattu.parentNode.classList.remove("korostus");
    }
    else if (klikattu.nodeName === "STRONG") {
        klikattu.parentNode.parentNode.classList.remove("korostus");
    }
    else if (klikattu.nodeName === "IMG") {
        klikattu.nextSibling.classList.remove("korostus");
    }
}

/* Korostetaan käyttäjän klikkaama maakortti. Jotta korostus onnistuu,
 * tutkitaan, mitä kortin elementtiä käyttäjä klikkasi.
 */
function korostaValinta(klikattu) {
    
    if (klikattu.nodeName === "DIV") {
        klikattu.classList.add("korostus");
    }
    else if (klikattu.nodeName === "P") {
        klikattu.parentNode.classList.add("korostus");
    }
    else if (klikattu.nodeName === "H5") {
        klikattu.parentNode.classList.add("korostus");
    }
    else if (klikattu.nodeName === "STRONG") {
        klikattu.parentNode.parentNode.classList.add("korostus");
    }
    else if (klikattu.nodeName === "IMG") {
        klikattu.nextSibling.classList.add("korostus");
    }
}

/* Päivitetään matkasuunnitelma näytöllä näkyvälle listalle.
 * Lista päivitetään tulostamalla se aina uudestaan, kun
 * muutoksia on tapahtunut.
 */
function paivitaLista() {

    let naytaReitti = document.getElementById("reitti");
    // Poistetaan aiemmin luodut solmut, että lista päivittyy oikein.
    while (naytaReitti.firstChild) {
        naytaReitti.removeChild(naytaReitti.firstChild);
    }

    // Luodaan lista uudestaan.
    let nimi = document.createElement("h5");
    nimi.textContent = "Traveller: " + matkustajaNimi;
    naytaReitti.appendChild(nimi);
    let uusiKohde = document.createElement("p");
    for (let i = 0; i < valitutMaat.length; i++) {
        uusiKohde.innerHTML += '<p class="card-text">'
            + valitutMaat[i].alpha3Code + '</p>';
    }  
    naytaReitti.appendChild(uusiKohde);
}


/* Tutkitaan, mistä maasta klikattiin. Funktio saa parametreina klikatun maan nimen 
 * sekä sen tason numeron, jolla maa lisättiin DOM-puuhun. Klikattu maa korostetaan
 * värillä, jos se on valittavissa. Korostettu maa lisätään valittujen maiden
 * taulukkoon. Jos klikataan jo korostettua maata, korostus poistuu ja samalla
 * matkasuunnitelmasta poistuu se maa sekä kaikki sen jälkeen valitut maat.
 */
function valittuMaa(maaNimi, taso) {

    // Haetaan oikea maaolio maatietojen taulukosta.
    let maa =_.filter(maaTiedot, function(obj) {
        return (obj.name == maaNimi);
    })[0];
    
    let klikattu = event.target;
    let kelpoMaa = true;

    // Tutkitaan, onko maassa jo käyty. Jos on, poistetaan maa ja kaikki
    // sen jälkeen valitut maat DOM-puusta ja matkasuunnitelmasta.
    for (let i = 0; i < valitutMaat.length; i++) {
        if (maa === valitutMaat[i]) {
            console.log("maassa on jo käyty!");
            kelpoMaa = false;

            let poistettava;
            // Poistetaan kaikki maat, jotka on lisätty valittua
            // maata seuraavilla tasoilla.
            for (let k = kierros - 1; k > taso; k--) {
                poistettava = document.getElementById("tier" + k);
                poistettava.remove();               
            }
            // Palautetaan kierroslaskin.
            kierros = taso + 1;

            // Poistetaan klikatun maan korostus.
            poistaValinta(klikattu);

            // Poistetaan maa ja kaikki sen jälkeen lisätyt maat listalta.
            valitutMaat.splice(i, valitutMaat.length - i);

            // Päivitetään matkasuunnitelma.
            paivitaLista();
        }
        // Estetään muissa tapauksissa klikkaukset muilta kuin nykyiseltä tasolta.
        else if (taso < kierros - 1 && maa !== valitutMaat[i]) {
            kelpoMaa = false;
        }
    }

    if (kelpoMaa === true) {

        // Kutsutaan funktiota, joka korostaa valitun maan.
        korostaValinta(klikattu);

        // Lisätään maa valittujen listalle alpha3-koodilla.
        valitutMaat.push(maa);

        let naapuriMaat = maa.borders;
        let naapuri;
        let seuraavatMaat = new Array();

        // Vertaillaan naapurimaiden listaa jo valittujen maiden listaan.
        // Jos naapurimaassa ei ole vielä käyty, lisätään se seuraavien maiden listaan.
        for (let i = 0; i < naapuriMaat.length; i++) {
            naapuri = _.filter(maaTiedot, function(obj){
                return (obj.alpha3Code == naapuriMaat[i]);
            });
            console.log(naapuri[0].name);

            let osuma = false;
            for (let j = 0; j < valitutMaat.length; j++) {
                if (naapuri[0].name === valitutMaat[j].name) {
                    osuma = true;
                }
            }
            if (osuma === false) {
                seuraavatMaat.push(naapuri[0]);
            }
        }
        console.log(seuraavatMaat);

        // Kutsutaan funktiota, joka tulostaa valitut maat näytölle.
        naytaMaat(seuraavatMaat);

        // Päivitetään matkasuunnitelma.
        paivitaLista();
    }

}

/* Tulostetaan maat näytölle Bootstrap-kortteina. Funktio saa parametrina
 * taulukon, jossa on sille tasolle valikoidut maaoliot. Jos kelvollisia maita
 * ei ole jäljellä, tulostetaan tästä ilmoitus ja kutsutaan matkayhteenvedon
 * tulostavaa funktiota.
 */
function naytaMaat(maat) {

    // Tehdään maakorttien säiliöille DOM-solmut ja lisätään ne DOM-puuhun.
    let nayta = document.getElementById("sisalto");
    let sailio = document.createElement("div");
    let otsikko = document.createElement("h2");

    /* Säiliölle asetetulla id:llä huolehditaan siitä, että koko osion voi
       poistaa, jos käyttäjä haluaa palata aiemmalle tasolle.*/
    sailio.setAttribute("id", "tier" + kierros);
    let korttiElem;
    let lisaysTaso = kierros;

    // Jos taulukossa oli vähintään yksi olio, tutkitaan sitä.
    if (maat.length > 0) {
        // Lisätään maalajitelman säiliö DOM-puuhun.
        nayta.appendChild(sailio)

        // Ensimmäisellä kierroksella tulostetaan ylimääräinen otsikko.
        if (kierros === 0) {
            let aloitus = document.createElement("h2");
            aloitus.textContent = "Select a starting country";
            sailio.appendChild(aloitus);
        }
        // Lisätään DOM-puun korttisäiliöön kierrosotsikko ja korttiryhmän div.
        otsikko.textContent = "Tier " + kierros;
        sailio.appendChild(otsikko);
        let korttiryhma = document.createElement("div");
        korttiryhma.classList.add("row");
        sailio.appendChild(korttiryhma);
        
        // Käydään läpi taulukon jokainen olio ja tulostetaan siitä 
        // tarvittavat tiedot Bootstrap-korttina.
        for (let i = 0; i < maat.length; i++) {
            korttiElem = document.createElement("div");
            korttiElem.classList.add("card", "col-12", "col-sm-12", "col-md-6", "col-lg-3");
    
            // Haetaan naapurimaat taulukosta merkkijonoon.
            let naapurimaat = "";
            for (let j = 0; j < maat[i].borders.length; j++){
                if (j === maat[i].borders.length - 1) {
                    naapurimaat += maat[i].borders[j] + ".";
                }
                else {
                    naapurimaat += maat[i].borders[j] + ", ";
                }
            }

            /* Lisätään DOM-puuhun kuva maan lipusta sekä seuraavat tiedot: maan nimi,
               pääkaupunki, valuutta (vain ensimmäinen, jos on useita) sekä naapurimaat. */
            korttiElem.innerHTML = '<img class="card-img-top" src="' + maat[i].flag + '" alt="maan lippu">'
                + '<div class="card-body"><h5 class="card-title">' + maat[i].name + '</h5>'
                + '<p class="card-text"><strong>Capital: </strong><br>' + maat[i].capital + '<br>'
                + '<strong>Currency: </strong><br>' + maat[i].currencies[0].name + ' (' 
                + maat[i].currencies[0].code + ').<br>' + '<strong>Borders: </strong><br>' + naapurimaat + '</p>';
                
            korttiryhma.appendChild(korttiElem);
    
            /* Lisätään kortille tapahtumankuuntelija. Kuuntelijalle välitetään tietona klikatun 
               maan nimi sekä taso, jolla se lisättiin DOM-puuhun. */
            korttiElem.addEventListener("click", function() {valittuMaa(maat[i].name, lisaysTaso)});
   
        }
        // Kasvatetaan kierroslaskuria.
        kierros++;      
    }
    // Jos taulukko oli tyhjä, ilmoitetaan, että valinnat loppuivat.
    else {
        nayta.appendChild(sailio);
        otsikko.textContent = "No more tiers possible.";
        sailio.appendChild(otsikko);

        // Kutsutaan operaatiota, joka näyttää yhteenvedon matkasta.
        naytaYhteenveto();
    }      
}

/* Suodatetaan aloitusmaiksi maat, joilla on vähintään 2 rajanaapuria.
 * Funktio saa parametrina kaikkien rajapinnasta haettujen maiden tiedot taulukkona.
 */
function suodataAloitusmaat(maaTiedot) {
    
    let maa;
    let naapurit;
    let aloitusmaat = new Array();

    /* Tutkitaan, montako naapuria maalla on. Jos naapureita
        on yli 1, lisätään alkio aloitusmaat-taulukkoon.*/
    for (let i = 0; i < maaTiedot.length; i++) {
        maa = maaTiedot[i];
        naapurit = maa.borders;
        if (naapurit.length > 1) {
            aloitusmaat.push(maa);
        }
    }
    // Arvotaan saadusta taulusta kolme satunnaista alkiota.
    let arvotut = _.sample(aloitusmaat, 3);
    // Kutsutaan funktiota, joka tulostaa näytölle annettujen maiden tiedot.
    naytaMaat(arvotut);
}

/* Haetaan maatiedot rajapinnasta ja syötetään ne globaaliin muuttujaan.
 * kutsutaan funktiota, joka suodattaa kaikkien maiden joukosta
 * kolme satunnaista maata aloitusmaiksi.
 */
function haeTiedot() {
    fetch("https://restcountries.eu/rest/v2/all")
    .then(
        function(response) {
            if (response.status !== 200) {
                console.log("Tiedon hakeminen ei onnistunut. Status code: " + response.status);
                return;
            }
            response.json().then(function (data) {
                maaTiedot = data;
                console.log(data);
                // Kutsutaan suodatusfunktiota.
                suodataAloitusmaat(maaTiedot);
                paivitaLista();
            });
        }       
    )
    .catch(function (error) {
        console.log("Fetch error :-S" + error);
    });
}


/* Tarkistetaan käyttäjän syöttämä nimi aina, kun input-kenttään
 * on tehty muutos. Hyväksymispainike aktivoituu, kun
 * input-kentässä on vähintään 2 sallittua merkkiä ja palaa
 * ei-aktiiviseen tilaan, jos merkkejä on alle 2 tai nimessä
 * on kiellettyjä merkkejä (muita kuin numeroita tai kirjaimia).
 * Ohjelma ei salli nimessä ääkkösiä.
 * Funktio saa parametrina input-kentän syötteen arvon.
 */
function tarkistaSyote(nimi) {

    let syoteBtn = document.getElementById("syotanimi");
    // Tarkistetaan nimen oikeellisuus regexillä.
    if (nimi.match("^[A-Za-z0-9]{2,}$")) {
        console.log("nimi on ok");
        syoteBtn.disabled = false;
    }
    else {
        syoteBtn.disabled = true;
    }
    syoteBtn.addEventListener("click", function() {
        // Asetetaan käyttäjän syöte matkustajan nimeksi.
        matkustajaNimi = nimi;
        // Poistetaan aloitusnäkymä.
        let poistettava = document.getElementById("alkutiedot");
        poistettava.remove();
        // Haetaan aloitusmaat.
        haeTiedot();
    });
}

/* Tulostetaan näytölle aloitusnäkymä, jossa käyttäjää pyydetään
 * syöttämään matkustajan nimi. Nimi syötetään painamalla
 * painiketta, joka on aktiivinen vain, kun nimisyötteessä
 * on vähintään kaksi sallittua merkkiä.
 */
function init() {
    
    let nayta = document.getElementById("sisalto");
    let uusiElem = document.createElement("div");
    uusiElem.classList.add("card", "border-0")
    uusiElem.setAttribute("id", "alkutiedot");

    uusiElem.innerHTML = '<div class="card-body"><h2 class="card-title">Welcome traveller!</h2>'
        + '<p class="card-text">Please enter your name:</p>'
        + '<input type="text" name="nimi" id="syote" pattern="[A-Za-z]{2,}">'
        + '<button id="syotanimi" disabled>Accept</button></div>';
    nayta.appendChild(uusiElem);
    let nimiSyote = document.getElementById("syote");

    // Asetetaan nimisyötteelle tapahtumankuuntelija.
    nimiSyote.addEventListener("input", function() {tarkistaSyote(nimiSyote.value)});
}

// Alustetaan globaalit muuttujat.
let maaTiedot;
let valitutMaat = new Array();
let kierros = 0;
let matkustajaNimi;

init();
