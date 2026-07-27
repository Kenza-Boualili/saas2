from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from fpdf import FPDF
import sqlite3
import re
import json
import os
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ☁️ CONFIGURATION CLIENT MISTRAL CLOUD
# ==========================================
client = OpenAI(
    base_url='https://api.mistral.ai/v1',
    api_key=os.environ.get("MISTRAL_API_KEY"),
)

DB_NAME = "artisan_v4.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS artisans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        mot_de_passe TEXT,
        nom_entreprise TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prospects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        artisan_id INTEGER,
        nom TEXT,
        probleme TEXT,
        telephone TEXT,
        adresse TEXT,
        urgent TEXT,
        date_creation TEXT,
        statut TEXT DEFAULT 'nouveau',
        date_intervention TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
        telephone TEXT PRIMARY KEY,
        historique TEXT DEFAULT '[]'
    )
    """)
    
    nouvelles_colonnes_artisans = [
        ("logo", "TEXT DEFAULT ''"),
        ("metier", "TEXT DEFAULT 'Artisan'"),
        ("telephone", "TEXT DEFAULT ''"),
        ("adresse", "TEXT DEFAULT ''"),
        ("horaires", "TEXT DEFAULT ''"),
        ("zone_intervention", "TEXT DEFAULT ''"),
        ("tarif_deplacement", "REAL DEFAULT 50.0"),
        ("tarif_horaire", "REAL DEFAULT 60.0"),
        ("ai_ton", "TEXT DEFAULT 'vouvoiement'"),
        ("ai_style", "TEXT DEFAULT 'professionnel'"),
        ("ai_consignes", "TEXT DEFAULT 'Demander d’abord le problème, puis le nom, le téléphone et l’adresse.'"),
        ("en_vacances", "INTEGER DEFAULT 0"),
        ("date_retour_vacances", "TEXT DEFAULT ''"),
        ("twilio_numero", "TEXT DEFAULT ''")
    ]
    for col_nom, col_type in nouvelles_colonnes_artisans:
        try:
            cursor.execute(f"ALTER TABLE artisans ADD COLUMN {col_nom} {col_type}")
        except sqlite3.OperationalError:
            pass

    nouvelles_colonnes_prospects = [
        ("historique_chat", "TEXT DEFAULT '[]'"),
        ("mode_facturation", "TEXT DEFAULT 'horaire'"),
        ("montant_forfait", "REAL DEFAULT 0.0"),
        ("montant_materiel", "REAL DEFAULT 0.0")
    ]
    for col_nom, col_type in nouvelles_colonnes_prospects:
        try:
            cursor.execute(f"ALTER TABLE prospects ADD COLUMN {col_nom} {col_type}")
        except sqlite3.OperationalError:
            pass
            
    conn.commit()
    conn.close()

init_db()

# ==========================================
# 🔐 AUTHENTIFICATION
# ==========================================
class RequeteInscription(BaseModel):
    email: str
    mot_de_passe: str
    nom_entreprise: str

@app.post("/api/inscription")
def inscrire_artisan(donnees: RequeteInscription):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO artisans (email, mot_de_passe, nom_entreprise) VALUES (?, ?, ?)", (donnees.email, donnees.mot_de_passe, donnees.nom_entreprise))
        artisan_id = cursor.lastrowid
        conn.commit()
        return {"success": True, "artisan_id": artisan_id, "nom_entreprise": donnees.nom_entreprise}
    except sqlite3.IntegrityError:
        return {"success": False, "erreur": "Cet email est déjà utilisé."}
    finally:
        conn.close()

class RequeteConnexion(BaseModel):
    email: str
    mot_de_passe: str

@app.post("/api/connexion")
def connecter_artisan(donnees: RequeteConnexion):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM artisans WHERE email = ? AND mot_de_passe = ?", (donnees.email, donnees.mot_de_passe))
    artisan = cursor.fetchone()
    conn.close()
    if artisan:
        return {"success": True, "artisan_id": artisan["id"], "nom_entreprise": artisan["nom_entreprise"]}
    else:
        return {"success": False, "erreur": "Email ou mot de passe incorrect."}

# ==========================================
# ⚙️ RÉGLAGES
# ==========================================
class ProfilArtisan(BaseModel):
    nom_entreprise: str
    metier: str
    logo: str
    telephone: str
    adresse: str
    horaires: str
    zone_intervention: str
    tarif_deplacement: float
    tarif_horaire: float
    ai_ton: str
    ai_style: str
    ai_consignes: str
    en_vacances: int
    date_retour_vacances: str
    twilio_numero: str = ""

@app.get("/api/artisans/{artisan_id}/profil")
def recuperer_profil(artisan_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT nom_entreprise, metier, logo, telephone, adresse, horaires, zone_intervention, tarif_deplacement, tarif_horaire, ai_ton, ai_style, ai_consignes, en_vacances, date_retour_vacances, twilio_numero FROM artisans WHERE id = ?", (artisan_id,))
    profil = cursor.fetchone()
    conn.close()
    if profil:
        return dict(profil)
    return {}

@app.put("/api/artisans/{artisan_id}/profil")
def mettre_a_jour_profil(artisan_id: int, profil: ProfilArtisan):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE artisans 
        SET nom_entreprise=?, metier=?, logo=?, telephone=?, adresse=?, horaires=?, zone_intervention=?, tarif_deplacement=?, tarif_horaire=?, ai_ton=?, ai_style=?, ai_consignes=?, en_vacances=?, date_retour_vacances=?, twilio_numero=?
        WHERE id=?
    """, (profil.nom_entreprise, profil.metier, profil.logo, profil.telephone, profil.adresse, profil.horaires, profil.zone_intervention, profil.tarif_deplacement, profil.tarif_horaire, profil.ai_ton, profil.ai_style, profil.ai_consignes, profil.en_vacances, profil.date_retour_vacances, profil.twilio_numero, artisan_id))
    conn.commit()
    conn.close()
    return {"success": True}

# ==========================================
# 📊 GESTION DES PROSPECTS & SAISIE MANUELLE
# ==========================================
@app.get("/api/prospects")
def recuperer_prospects(artisan_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM prospects WHERE artisan_id = ? ORDER BY id DESC", (artisan_id,))
    lignes = cursor.fetchall()
    conn.close()
    return {"prospects": [dict(ligne) for ligne in lignes]}

class RequeteCreationProspect(BaseModel):
    artisan_id: int
    nom: str
    probleme: str
    telephone: str
    adresse: str
    statut: str = "nouveau"
    date_intervention: str = ""
    urgent: str = "non"

@app.post("/api/prospects")
def creer_prospect_manuel(donnees: RequeteCreationProspect):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    date_actuelle = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    statut_final = "archive" if donnees.statut == "termine" else donnees.statut
    
    cursor.execute(
        """INSERT INTO prospects (artisan_id, nom, probleme, telephone, adresse, urgent, date_creation, statut, date_intervention) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (donnees.artisan_id, donnees.nom, donnees.probleme, donnees.telephone, donnees.adresse, donnees.urgent, date_actuelle, statut_final, donnees.date_intervention or None)
    )
    conn.commit()
    conn.close()
    return {"success": True}

class RequeteStatut(BaseModel):
    statut: str

STATUTS_VALIDES = ["nouveau", "contacte", "planifie", "termine", "archive", "annule"]

@app.put("/api/prospects/{prospect_id}/statut")
def changer_statut(prospect_id: int, donnees: RequeteStatut):
    if donnees.statut not in STATUTS_VALIDES:
        return {"success": False, "erreur": "Statut invalide."}
    
    statut_final = "archive" if donnees.statut == "termine" else donnees.statut

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE prospects SET statut = ? WHERE id = ?", (statut_final, prospect_id))
    conn.commit()
    conn.close()
    return {"success": True}

class RequeteRendezVous(BaseModel):
    date_intervention: str

@app.put("/api/prospects/{prospect_id}/rendezvous")
def fixer_rendezvous(prospect_id: int, donnees: RequeteRendezVous):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE prospects SET date_intervention = ? WHERE id = ?", (donnees.date_intervention, prospect_id))
    conn.commit()
    conn.close()
    return {"success": True}

class RequeteFacturation(BaseModel):
    mode_facturation: str
    montant_forfait: float = 0.0
    montant_materiel: float = 0.0

@app.put("/api/prospects/{prospect_id}/facturation")
def configurer_facturation_prospect(prospect_id: int, donnees: RequeteFacturation):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE prospects SET mode_facturation = ?, montant_forfait = ?, montant_materiel = ? WHERE id = ?",
        (donnees.mode_facturation, donnees.montant_forfait, donnees.montant_materiel, prospect_id)
    )
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/prospects/{prospect_id}")
def archiver_prospect(prospect_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE prospects SET statut = 'archive' WHERE id = ?", (prospect_id,))
    conn.commit()
    conn.close()
    return {"success": True}

# ==========================================
# 📄 LE GÉNÉRATEUR INTELLIGENT DE PDF (SÉCURISÉ)
# ==========================================
def nettoyer_texte(texte):
    if not texte:
        return ""
    return str(texte).encode('latin-1', 'replace').decode('latin-1')

@app.get("/api/prospects/{prospect_id}/document")
def generer_document(prospect_id: int, type_doc: str = "facture"):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.*, a.nom_entreprise, a.metier, a.email, a.tarif_deplacement, a.tarif_horaire, a.adresse as adresse_artisan, a.telephone as tel_artisan 
        FROM prospects p
        JOIN artisans a ON p.artisan_id = a.id
        WHERE p.id = ?
    ''', (prospect_id,))
    donnees = cursor.fetchone()
    conn.close()

    if not donnees:
        raise HTTPException(status_code=404, detail="Prospect introuvable")

    titre_document = "DEVIS ESTIMATIF" if type_doc == "devis" else "FACTURE D'INTERVENTION"
    texte_bas_page = "Devis valable 30 jours. Bon pour accord et signature :" if type_doc == "devis" else "Merci de votre confiance. Paiement attendu sous 15 jours."
    prefixe_fichier = "Devis" if type_doc == "devis" else "Facture"

    mode_fact = donnees['mode_facturation'] or 'horaire'
    montant_materiel = float(donnees['montant_materiel'] or 0)

    if mode_fact == 'forfait':
        montant_forfait = float(donnees['montant_forfait'] or 0)
        total_prix = montant_forfait + montant_materiel
    else:
        prix_dep = float(donnees['tarif_deplacement'] or 0)
        prix_horaire = float(donnees['tarif_horaire'] or 0)
        total_prix = prix_dep + prix_horaire + montant_materiel

    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("helvetica", "B", 18)
    pdf.set_text_color(37, 99, 235)
    pdf.cell(0, 8, nettoyer_texte(donnees["nom_entreprise"]), new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.set_font("helvetica", "I", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, nettoyer_texte(donnees["metier"]), new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 5, nettoyer_texte(f"Email Pro: {donnees['email']}"), new_x="LMARGIN", new_y="NEXT", align="L")
    if donnees['tel_artisan']: pdf.cell(0, 5, nettoyer_texte(f"Tél: {donnees['tel_artisan']}"), new_x="LMARGIN", new_y="NEXT", align="L")
    if donnees['adresse_artisan']: pdf.cell(0, 5, nettoyer_texte(donnees['adresse_artisan']), new_x="LMARGIN", new_y="NEXT", align="L")
    
    pdf.cell(0, 8, f"Date d'edition : {datetime.now().strftime('%d/%m/%Y')}", new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 15, titre_document, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "ADRESSE A :", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 6, nettoyer_texte(f"Nom : {donnees['nom']}"), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, nettoyer_texte(f"Adresse : {donnees['adresse']}"), new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, nettoyer_texte(f"Telephone : {donnees['telephone']}"), new_x="LMARGIN", new_y="NEXT")
    
    if type_doc == "devis" and donnees["date_intervention"]:
        date_rdv_brute = donnees["date_intervention"]
        try:
            dt_str = date_rdv_brute.replace('T', ' ')
            date_rdv = datetime.strptime(dt_str.split('.')[0], "%Y-%m-%d %H:%M:%S").strftime('%d/%m/%Y a %H:%M')
        except Exception:
            date_rdv = date_rdv_brute
        
        pdf.set_text_color(37, 99, 235)
        pdf.cell(0, 6, nettoyer_texte(f"Intervention prevue le : {date_rdv}"), new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)

    pdf.ln(10)

    pdf.set_font("helvetica", "B", 12)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(120, 10, "Description", border=1, fill=True)
    pdf.cell(30, 10, "Qte", border=1, align="C", fill=True)
    pdf.cell(40, 10, "Montant", border=1, align="R", fill=True, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "", 12)

    if mode_fact == 'forfait':
        pdf.cell(120, 10, nettoyer_texte(f"Prestation Forfaitaire : {donnees['probleme']}"), border=1)
        pdf.cell(30, 10, "1", border=1, align="C")
        pdf.cell(40, 10, f"{montant_forfait:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    else:
        pdf.cell(120, 10, "Frais de deplacement", border=1)
        pdf.cell(30, 10, "1", border=1, align="C")
        pdf.cell(40, 10, f"{prix_dep:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
        
        pdf.cell(120, 10, nettoyer_texte(f"Main d'oeuvre : {donnees['probleme']}"), border=1)
        pdf.cell(30, 10, "1h", border=1, align="C")
        pdf.cell(40, 10, f"{prix_horaire:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    if montant_materiel > 0:
        pdf.cell(120, 10, "Fournitures / Materiel", border=1)
        pdf.cell(30, 10, "1", border=1, align="C")
        pdf.cell(40, 10, f"{montant_materiel:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(150, 12, "TOTAL ESTIMBE TTC" if type_doc == "devis" else "TOTAL TTC A PAYER", border=1, align="R")
    pdf.cell(40, 12, f"{total_prix:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(20)
    pdf.set_font("helvetica", "I", 10)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, nettoyer_texte(texte_bas_page), new_x="LMARGIN", new_y="NEXT", align="C")

    pdf_bytes = bytes(pdf.output())
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={prefixe_fichier}_{donnees['id']}.pdf"})

# ==========================================
# 📧 SYSTÈME D'ALERTE EMAIL
# ==========================================
def envoyer_email_alerte(email_artisan, nom_client, telephone, probleme):
    print(f"[EMAIL] Alerte envoyée à {email_artisan} pour {nom_client}")

# ==========================================
# 🤖 LE CHATBOT (WEB) & TWILIO WHATSAPP
# ==========================================
class RequeteChat(BaseModel):
    artisan_id: int
    nouveau_message: str
    historique: list

@app.post("/api/chat")
async def discuter_avec_ia(donnees: RequeteChat):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM artisans WHERE id = ?", (donnees.artisan_id,))
    artisan = cursor.fetchone()
    conn.close()
    
    if not artisan: return {"reponse": "Erreur : Artisan introuvable."}

    contexte_vacances = ""
    if artisan["en_vacances"] == 1:
        date_retour_exacte = artisan['date_retour_vacances'] or 'prochainement'
        contexte_vacances = f"\n⚠️ ATTENTION VACANCES : L'artisan est actuellement EN VACANCES jusqu'au {date_retour_exacte}."

    prompt_contexte = f"""Tu es l'assistant d'accueil virtuel de l'entreprise '{artisan['nom_entreprise']}' spécialisée en {artisan['metier']}.
{contexte_vacances}

DIRECTIVES DE L'ARTISAN :
- Ton : {artisan['ai_ton']}
- Style : {artisan['ai_style']}
- Consignes : {artisan['ai_consignes']}

OBJECTIF : Collecter le problème, le nom, le téléphone et l'adresse complète avant de clôturer l'échange. Ne dis jamais au revoir avant d'avoir ces 4 infos.
RÈGLE ABSOLUE : Ne parle jamais d'e-mail.
"""

    messages_pour_ia = [{"role": "system", "content": prompt_contexte}]
    for msg in donnees.historique: 
        messages_pour_ia.append({"role": msg["role"], "content": msg["content"]})
    messages_pour_ia.append({"role": "user", "content": donnees.nouveau_message})

    try:
        reponse_ia = client.chat.completions.create(model="mistral-small-latest", messages=messages_pour_ia)
        texte_reponse = reponse_ia.choices[0].message.content
    except Exception as e:
        return {"reponse": f"Erreur : {str(e)}"}

    historique_complet = donnees.historique + [
        {"role": "user", "content": donnees.nouveau_message},
        {"role": "assistant", "content": texte_reponse}
    ]
    conversation_complete = "\n".join([f"{m['role']}: {m['content']}" for m in historique_complet])

    prompt_extraction = [{
        "role": "system", 
        "content": f"""Analyse cette conversation avec un client pour un {artisan['metier']}.
Renvoie UNIQUEMENT un objet JSON valide avec ces clés :
- "complet": true si tu as le problème, le nom, l'adresse et le téléphone, sinon false.
- "nom": nom du client ou "Client".
- "probleme": problème technique.
- "adresse": adresse postale ou "".
- "telephone": téléphone ou "".
- "urgent": "oui" ou "non".
Renvoie uniquement le JSON pur sans markdown."""
    }, {
        "role": "user", 
        "content": conversation_complete
    }]

    try:
        reponse_extraction = client.chat.completions.create(model="mistral-small-latest", messages=prompt_extraction)
        texte_nettoye = reponse_extraction.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        donnees_propres = json.loads(texte_nettoye)
        
        if donnees_propres.get("complet") == True and donnees_propres.get("telephone"):
            nom_final = donnees_propres.get("nom", "Client")
            probleme_final = donnees_propres.get("probleme", "Demande")
            adresse_final = donnees_propres.get("adresse", "À préciser")
            telephone_final = donnees_propres.get("telephone", "")
            urgent_final = str(donnees_propres.get("urgent", "non")).lower()
            
            historique_json = json.dumps(historique_complet)
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            date_actuelle = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor.execute("SELECT id FROM prospects WHERE telephone = ? AND artisan_id = ? AND statut NOT IN ('termine', 'archive')", (telephone_final, donnees.artisan_id))
            existe = cursor.fetchone()
            
            if not existe:
                cursor.execute(
                    "INSERT INTO prospects (artisan_id, nom, probleme, telephone, adresse, urgent, date_creation, statut, historique_chat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                    (donnees.artisan_id, nom_final, probleme_final, telephone_final, adresse_final, urgent_final, date_actuelle, "nouveau", historique_json)
                )
                conn.commit()
                envoyer_email_alerte(artisan['email'], nom_final, telephone_final, probleme_final)
            conn.close()
    except Exception as ex:
        print("Erreur d'extraction automatique :", ex)

    return {"reponse": texte_reponse}
