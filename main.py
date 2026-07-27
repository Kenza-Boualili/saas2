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
    
    nouvelles_colonnes = [
        ("logo", "TEXT DEFAULT ''"),
        ("metier", "TEXT DEFAULT 'Artisan'"),
        ("telephone", "TEXT DEFAULT ''"),
        ("adresse", "TEXT DEFAULT ''"),
        ("horaires", "TEXT DEFAULT ''"),
        ("zone_intervention", "TEXT DEFAULT ''"),
        ("tarif_deplacement", "REAL DEFAULT 50.0"),
        ("tarif_horaire", "REAL DEFAULT 60.0"),
        ("historique_chat", "TEXT DEFAULT '[]'"),
        ("ai_ton", "TEXT DEFAULT 'vouvoiement'"),
        ("ai_style", "TEXT DEFAULT 'professionnel'"),
        ("ai_consignes", "TEXT DEFAULT 'Demander d’abord le problème, puis le nom, le téléphone et l’adresse.'"),
        ("en_vacances", "INTEGER DEFAULT 0"),
        ("date_retour_vacances", "TEXT DEFAULT ''")
    ]
    for col_nom, col_type in nouvelles_colonnes:
        try:
            cursor.execute(f"ALTER TABLE artisans ADD COLUMN {col_nom} {col_type}")
        except sqlite3.OperationalError:
            pass
        try:
            if col_nom == "historique_chat":
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

@app.get("/api/artisans/{artisan_id}/profil")
def recuperer_profil(artisan_id: int):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT nom_entreprise, metier, logo, telephone, adresse, horaires, zone_intervention, tarif_deplacement, tarif_horaire, ai_ton, ai_style, ai_consignes, en_vacances, date_retour_vacances FROM artisans WHERE id = ?", (artisan_id,))
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
        SET nom_entreprise=?, metier=?, logo=?, telephone=?, adresse=?, horaires=?, zone_intervention=?, tarif_deplacement=?, tarif_horaire=?, ai_ton=?, ai_style=?, ai_consignes=?, en_vacances=?, date_retour_vacances=?
        WHERE id=?
    """, (profil.nom_entreprise, profil.metier, profil.logo, profil.telephone, profil.adresse, profil.horaires, profil.zone_intervention, profil.tarif_deplacement, profil.tarif_horaire, profil.ai_ton, profil.ai_style, profil.ai_consignes, profil.en_vacances, profil.date_retour_vacances, artisan_id))
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

@app.delete("/api/prospects/{prospect_id}")
def archiver_prospect(prospect_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE prospects SET statut = 'archive' WHERE id = ?", (prospect_id,))
    conn.commit()
    conn.close()
    return {"success": True}

# ==========================================
# 📄 LE GÉNÉRATEUR INTELLIGENT DE PDF
# ==========================================
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

    prix_dep = float(donnees['tarif_deplacement'] or 0)
    prix_horaire = float(donnees['tarif_horaire'] or 0)
    total_prix = prix_dep + prix_horaire

    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("helvetica", "B", 18)
    pdf.set_text_color(37, 99, 235)
    pdf.cell(0, 8, donnees["nom_entreprise"], new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.set_font("helvetica", "I", 12)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, donnees["metier"], new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.set_font("helvetica", "", 10)
    pdf.cell(0, 5, f"Email Pro: {donnees['email']}", new_x="LMARGIN", new_y="NEXT", align="L")
    if donnees['tel_artisan']: pdf.cell(0, 5, f"Tél: {donnees['tel_artisan']}", new_x="LMARGIN", new_y="NEXT", align="L")
    if donnees['adresse_artisan']: pdf.cell(0, 5, f"{donnees['adresse_artisan']}", new_x="LMARGIN", new_y="NEXT", align="L")
    
    pdf.cell(0, 8, f"Date d'édition : {datetime.now().strftime('%d/%m/%Y')}", new_x="LMARGIN", new_y="NEXT", align="L")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "B", 24)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 15, titre_document, new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(10)
    
    pdf.set_font("helvetica", "B", 12)
    pdf.cell(0, 8, "ADRESSÉ À :", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("helvetica", "", 12)
    pdf.cell(0, 6, f"Nom : {donnees['nom']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Adresse : {donnees['adresse']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 6, f"Téléphone : {donnees['telephone']}", new_x="LMARGIN", new_y="NEXT")
    
    if type_doc == "devis" and donnees["date_intervention"]:
        date_rdv = datetime.strptime(donnees["date_intervention"], "%Y-%m-%dT%H:%M").strftime('%d/%m/%Y à %H:%M')
        pdf.set_text_color(37, 99, 235)
        pdf.cell(0, 6, f"Intervention prévue le : {date_rdv}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_text_color(0, 0, 0)

    pdf.ln(10)

    pdf.set_font("helvetica", "B", 12)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(120, 10, "Description", border=1, fill=True)
    pdf.cell(30, 10, "Qté", border=1, align="C", fill=True)
    pdf.cell(40, 10, "Montant", border=1, align="R", fill=True, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "", 12)
    pdf.cell(120, 10, "Frais de déplacement", border=1)
    pdf.cell(30, 10, "1", border=1, align="C")
    pdf.cell(40, 10, f"{prix_dep:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.cell(120, 10, f"Main d'oeuvre : {donnees['probleme']}", border=1)
    pdf.cell(30, 10, "1h", border=1, align="C")
    pdf.cell(40, 10, f"{prix_horaire:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(150, 12, "TOTAL ESTIMÉ TTC" if type_doc == "devis" else "TOTAL TTC À PAYER", border=1, align="R")
    pdf.cell(40, 12, f"{total_prix:.2f} EUR", border=1, align="R", new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(20)
    pdf.set_font("helvetica", "I", 10)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, texte_bas_page, new_x="LMARGIN", new_y="NEXT", align="C")

    pdf_bytes = bytes(pdf.output())
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={prefixe_fichier}_{donnees['id']}_{donnees['nom'].replace(' ', '_')}.pdf"})

# ==========================================
# 📧 SYSTÈME D'ALERTE EMAIL
# ==========================================
def envoyer_email_alerte(email_artisan, nom_client, telephone, probleme):
    print("\n" + "="*60)
    print(f"[SIMULATION D'ENVOI D'EMAIL] DESTINATAIRE : {email_artisan}")
    print(f"SUJET : ArtisanAI - Nouvelle demande d'intervention")
    print(f"Nom du client : {nom_client}")
    print(f"Téléphone     : {telephone}")
    print(f"Problème      : {probleme}")
    print("="*60 + "\n")

# ==========================================
# 📱 WEBHOOK WHATSAPP
# ==========================================
@app.post("/api/webhook/twilio")
async def webhook_twilio(From: str = Form(...), Body: str = Form(...)):
    telephone_client_defaut = From.replace("whatsapp:", "")
    message_client = Body

    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM artisans LIMIT 1")
    artisan = cursor.fetchone()
    
    if not artisan:
        conn.close()
        xml_erreur = "<Response><Message>Erreur : Aucun artisan configure.</Message></Response>"
        return Response(content=xml_erreur, media_type="application/xml")

    artisan_id = artisan["id"]

    cursor.execute("SELECT id, statut FROM prospects WHERE telephone = ? AND statut NOT IN ('termine', 'archive') ORDER BY id DESC LIMIT 1", (telephone_client_defaut,))
    prospect_actif = cursor.fetchone()

    cursor.execute("SELECT historique FROM whatsapp_conversations WHERE telephone = ?", (telephone_client_defaut,))
    row = cursor.fetchone()
    
    if not prospect_actif:
        historique = [] 
    else:
        historique = json.loads(row["historique"]) if row else []

    historique.append({"role": "user", "content": message_client})

    contexte_vacances = ""
    if artisan["en_vacances"] == 1:
        date_retour_exacte = artisan['date_retour_vacances'] or 'prochainement'
        contexte_vacances = f"\n⚠️ ATTENTION VACANCES : L'artisan est actuellement EN VACANCES jusqu'au {date_retour_exacte}. RÈGLE STRICTE : Tu DOIS obligatoirement indiquer au client la date exacte du {date_retour_exacte}. NE CALCULE PAS et N'INVENTE PAS d'autres dates !"

    prompt_contexte = f"""Tu es l'assistant de '{artisan['nom_entreprise']}' ({artisan['metier']}). 
Ton ton : {artisan['ai_ton']}. Style : {artisan['ai_style']}.
{contexte_vacances}
OBJECTIF : Obtenir impérativement le problème, le nom, l'adresse ET le numéro de téléphone du client.
RÈGLE CRITIQUE : Ne valide JAMAIS la fin de la conversation tant que tu n'as pas le numéro de téléphone. Si le client donne son nom et son adresse mais pas son numéro, demande son numéro de téléphone.
Sois concis (2 phrases max)."""

    messages_pour_ia = [{"role": "system", "content": prompt_contexte}] + historique

    try:
        reponse_ia = client.chat.completions.create(model="mistral-small-latest", messages=messages_pour_ia)
        texte_reponse = reponse_ia.choices[0].message.content
    except Exception as e:
        texte_reponse = "Bonjour, nous avons bien reçu votre message. Nous vous recontactons très vite !"

    historique.append({"role": "assistant", "content": texte_reponse})

    cursor.execute("""
        INSERT INTO whatsapp_conversations (telephone, historique) VALUES (?, ?)
        ON CONFLICT(telephone) DO UPDATE SET historique = ?
    """, (telephone_client_defaut, json.dumps(historique), json.dumps(historique)))
    conn.commit()

    est_une_annulation = any(mot in message_client.lower() for mot in ["annuler", "annulation", "annule"])

    conversation_complete = "\n".join([f"{m['role']}: {m['content']}" for m in historique])
    
    prompt_extraction = [{
        "role": "system", 
        "content": f"""Tu es un robot d'extraction de données rigoureux pour un {artisan['metier']}. 
Analyse la conversation et renvoie UNIQUEMENT un objet JSON valide avec exactement ces 5 clés :
- "nom": le nom du dernier client mentionné s'il est donné, sinon "Client WhatsApp".
- "probleme": uniquement le dernier problème technique mentionné.
- "adresse": la dernière adresse postale complète si elle est mentionnée, sinon "À préciser".
- "telephone": le numéro de téléphone communiqué par le client dans le chat (ex: 0612345678), sinon "{telephone_client_defaut}".
- "urgent": "oui" s'il y a un danger absolu, sinon "non".
Renvoie uniquement le JSON pur sans markdown."""
    }, {
        "role": "user", 
        "content": conversation_complete
    }]
    
    try:
        reponse_extraction = client.chat.completions.create(model="mistral-small-latest", messages=prompt_extraction)
        texte_nettoye = reponse_extraction.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        donnees_propres = json.loads(texte_nettoye)
        nom_final = donnees_propres.get("nom", "Client WhatsApp")
        probleme_final = donnees_propres.get("probleme", "Demande WhatsApp")
        adresse_final = donnees_propres.get("adresse", "À préciser")
        telephone_final = donnees_propres.get("telephone", telephone_client_defaut)
        urgent_final = str(donnees_propres.get("urgent", "non")).lower()
        if urgent_final not in ["oui", "non"]: urgent_final = "non"
    except:
        nom_final = "Client WhatsApp"; probleme_final = message_client; adresse_final = "À préciser"; telephone_final = telephone_client_defaut; urgent_final = "non"

    historique_json = json.dumps(historique)
    nouveau_statut = "annule" if est_une_annulation else "nouveau"
    date_actuelle = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if prospect_actif:
        cursor.execute(
            "UPDATE prospects SET nom = ?, probleme = ?, adresse = ?, telephone = ?, urgent = ?, statut = ?, historique_chat = ? WHERE id = ?",
            (nom_final, probleme_final, adresse_final, telephone_final, urgent_final, nouveau_statut, historique_json, prospect_actif["id"])
        )
    else:
        cursor.execute(
            "INSERT INTO prospects (artisan_id, nom, probleme, telephone, adresse, urgent, date_creation, statut, historique_chat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (artisan_id, nom_final, probleme_final, telephone_final, adresse_final, urgent_final, date_actuelle, nouveau_statut, historique_json)
        )
        if not est_une_annulation:
            envoyer_email_alerte(artisan['email'], nom_final, telephone_final, probleme_final)

    conn.commit()
    conn.close()

    xml_reponse = f"""<Response>
        <Message>{texte_reponse}</Message>
    </Response>"""
    
    return Response(content=xml_reponse, media_type="application/xml")

# ==========================================
# 🤖 LE CHATBOT (WEB)
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

    # 1. Construction du contexte avec tes consignes personnalisées
    contexte_vacances = ""
    if artisan["en_vacances"] == 1:
        date_retour_exacte = artisan['date_retour_vacances'] or 'prochainement'
        contexte_vacances = f"\n⚠️ ATTENTION VACANCES : L'artisan est actuellement EN VACANCES jusqu'au {date_retour_exacte}. Indique au client la date exacte du {date_retour_exacte} sans la changer !"

    prompt_contexte = f"""Tu es l'assistant d'accueil virtuel de l'entreprise '{artisan['nom_entreprise']}' spécialisée en {artisan['metier']}.
{contexte_vacances}

DIRECTIVES DE L'ARTISAN (À RESPECTER IMPÉRATIVEMENT) :
- Ton : {artisan['ai_ton']}
- Style : {artisan['ai_style']}
- Consignes et ordre des questions : {artisan['ai_consignes']}

OBJECTIF CRITIQUE : Tu dois collecter tour à tour : le problème, le nom du client, son numéro de téléphone ET son adresse complète avant de clôturer l'échange. Ne dis jamais au revoir tant que tu n'as pas obtenu ces 4 informations.
"""

    messages_pour_ia = [{"role": "system", "content": prompt_contexte}]
    for msg in donnees.historique: 
        messages_pour_ia.append({"role": msg["role"], "content": msg["content"]})
    messages_pour_ia.append({"role": "user", "content": donnees.nouveau_message})

    # 2. Appel à Mistral pour obtenir la réponse du chatbot
    try:
        reponse_ia = client.chat.completions.create(model="mistral-small-latest", messages=messages_pour_ia)
        texte_reponse = reponse_ia.choices[0].message.content
    except Exception as e:
        return {"reponse": f"Erreur : {str(e)}"}

    # 3. On met à jour l'historique complet de la conversation
    historique_complet = donnees.historique + [
        {"role": "user", "content": donnees.nouveau_message},
        {"role": "assistant", "content": texte_reponse}
    ]
    conversation_complete = "\n".join([f"{m['role']}: {m['content']}" for m in historique_complet])

    # 4. Analyse intelligente par Mistral pour voir si la conversation est terminée et si on a toutes les infos
    prompt_extraction = [{
        "role": "system", 
        "content": f"""Analyse cette conversation avec un client pour un {artisan['metier']}.
Renvoie UNIQUEMENT un objet JSON valide avec ces 5 clés :
- "complet": true si tu as réussi à obtenir le problème, le nom, l'adresse et le téléphone, sinon false.
- "nom": le nom du client s'il a été donné, sinon "Client Anonyme".
- "probleme": le problème technique mentionné.
- "adresse": l'adresse postale si elle a été donnée, sinon "".
- "telephone": le numéro de téléphone s'il a été donné, sinon "".
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
        
        # Si la conversation est complète (qu'on a récupéré l'adresse et le tel), on enregistre dans la base de données
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
            
            # Vérifie si le prospect existe déjà pour éviter les doublons lors de la même session
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
