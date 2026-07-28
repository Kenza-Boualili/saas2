import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, MessageSquare, AlertCircle, Wrench, Phone, MapPin, Send, Filter, LogOut, Lock, Mail, Building2, Calendar, Clock, Download, Archive, FileText, Settings, Save, Euro, Map, Users, Search, Eye, X, BellRing, BarChart3, TrendingUp, PieChart, Bot, Plus, Wallet, FileSpreadsheet, Receipt, Truck, ShoppingCart, Package, CalendarCheck, ShieldAlert, Target, Bell, Moon, Sun, User, LogOut as SignOut, Settings as SettingsIcon } from "lucide-react"

const API_URL = "https://artisan-ai-zirt.onrender.com";

const STATUTS_TOUS = [
  { valeur: 'nouveau', label: 'Nouveau', couleur: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { valeur: 'contacte', label: 'À relancer', couleur: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { valeur: 'planifie', label: 'Planifié', couleur: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { valeur: 'termine', label: 'Terminé', couleur: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { valeur: 'annule', label: 'Annulé', couleur: 'bg-red-500/10 text-red-400 border-red-500/30' },
  { valeur: 'archive', label: 'Archivé', couleur: 'bg-slate-800/50 text-slate-500 border-slate-700/50' },
]

const MOIS_ANNEE = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function App() {
  const [artisanConnecte, setArtisanConnecte] = useState(null)
  const [vueAuth, setVueAuth] = useState('connexion')
  
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [nomEntreprise, setNomEntreprise] = useState('')
  const [erreurAuth, setErreurAuth] = useState('')

  const [vueActuelle, setVueActuelle] = useState('dashboard') 
  const [prospects, setProspects] = useState([])
  const [chargement, setChargement] = useState(false)
  const [rechercheClient, setRechercheClient] = useState('')
  const [prospectSelectionne, setProspectSelectionne] = useState(null)

  // États pour les popups du header (Notifications et Profil)
  const [menuNotifOuvert, setMenuNotifOuvert] = useState(false)
  const [menuProfilOuvert, setMenuProfilOuvert] = useState(false)

  // Génération dynamique des années (de 2026 jusqu'à l'année actuelle réelle)
  const anneeActuelleReelle = new Date().getFullYear();
  const anneesDisponibles = [];
  for (let y = 2026; y <= anneeActuelleReelle; y++) {
    anneesDisponibles.push(y);
  }
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(anneeActuelleReelle);

  // États facturation & modale
  const [modeFacturation, setModeFacturation] = useState('horaire')
  const [montantForfait, setMontantForfait] = useState('')
  const [montantMateriel, setMontantMateriel] = useState('')
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false)
  
  const [formManuel, setFormManuel] = useState({
    nom: '', probleme: '', telephone: '', adresse: '', statut: 'nouveau', date_intervention: '', urgent: 'non'
  })

  const [hoverIndexCa, setHoverIndexCa] = useState(null);
  const [hoverIndexAct, setHoverIndexAct] = useState(null);

  const [messages, setMessages] = useState([])
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [iaReflechit, setIaReflechit] = useState(false)

  const [profil, setProfil] = useState({
    nom_entreprise: '', metier: 'Artisan', logo: '', telephone: '', adresse: '',
    horaires: '', zone_intervention: '', tarif_deplacement: 50, tarif_horaire: 60,
    ai_ton: 'vouvoiement', ai_style: 'professionnel', ai_consignes: 'Demander d’abord le problème, puis le nom, le téléphone et l’adresse.',
    en_vacances: 0, date_retour_vacances: ''
  })
  const [messageSauvegarde, setMessageSauvegarde] = useState('')

  const gererInscription = async (e) => {
    e.preventDefault(); setErreurAuth('')
    try {
      const res = await fetch(`${API_URL}/api/inscription`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, mot_de_passe: motDePasse, nom_entreprise: nomEntreprise }) })
      const data = await res.json()
      if (data.success) connecterUtilisateur(data.artisan_id, data.nom_entreprise, email)
      else setErreurAuth(data.erreur || "Erreur d'inscription")
    } catch (err) { setErreurAuth("Erreur serveur.") }
  }

  const gererConnexion = async (e) => {
    e.preventDefault(); setErreurAuth('')
    try {
      const res = await fetch(`${API_URL}/api/connexion`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, mot_de_passe: motDePasse }) })
      const data = await res.json()
      if (data.success) connecterUtilisateur(data.artisan_id, data.nom_entreprise, email)
      else setErreurAuth(data.erreur || "Identifiants incorrects")
    } catch (err) { setErreurAuth("Erreur serveur.") }
  }

  const connecterUtilisateur = (id, nom, mailUtilisateur = '') => {
    setArtisanConnecte({ id, nom_entreprise: nom, email: mailUtilisateur || email })
    setMessages([{ role: 'assistant', content: `Bonjour ! Je suis l'assistant de l'entreprise ${nom || 'Pro'}. Quel est votre besoin aujourd'hui ?` }])
    setEmail(''); setMotDePasse(''); setNomEntreprise('');
  }

  const deconnexion = () => {
    setArtisanConnecte(null); setProspects([]); setVueActuelle('dashboard');
  }

  const chargerProspects = (silencieux = false) => {
    if (!artisanConnecte?.id) return
    if (!silencieux) setChargement(true)
    fetch(`${API_URL}/api/prospects?artisan_id=${artisanConnecte.id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { 
        setProspects(data?.prospects || []); 
        setChargement(false) 
      })
      .catch(err => setChargement(false))
  }

  const chargerProfil = async () => {
    if (!artisanConnecte?.id) return
    try {
      const res = await fetch(`${API_URL}/api/artisans/${artisanConnecte.id}/profil`)
      const data = await res.json()
      if (data && data.nom_entreprise) setProfil(data)
    } catch (err) {}
  }

  const sauvegarderProfil = async (e) => {
    e.preventDefault(); setMessageSauvegarde('Sauvegarde en cours...')
    try {
      await fetch(`${API_URL}/api/artisans/${artisanConnecte.id}/profil`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profil) })
      setMessageSauvegarde('Modifications enregistrées.')
      setTimeout(() => setMessageSauvegarde(''), 3000)
    } catch (erreur) {
      setMessageSauvegarde('Erreur de sauvegarde.')
      setTimeout(() => setMessageSauvegarde(''), 3000)
    }
  }

  const soumettreClientManuel = async (e) => {
    e.preventDefault();
    if (!artisanConnecte?.id) return;
    try {
      const res = await fetch(`${API_URL}/api/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formManuel, artisan_id: artisanConnecte.id })
      });
      const data = await res.json();
      if (data.success) {
        setModalAjoutOuvert(false);
        setFormManuel({ nom: '', probleme: '', telephone: '', adresse: '', statut: 'nouveau', date_intervention: '', urgent: 'non' });
        chargerProspects(true);
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement.");
    }
  }

  const changerStatut = async (id, nouveauStatut) => {
    const statutFinal = nouveauStatut === 'termine' ? 'archive' : nouveauStatut;
    setProspects(prospectsActuels => (prospectsActuels || []).map(p => p.id === id ? { ...p, statut: statutFinal } : p))
    if (prospectSelectionne && prospectSelectionne.id === id) {
      if (statutFinal === 'archive') setProspectSelectionne(null);
      else setProspectSelectionne(prev => ({...prev, statut: statutFinal}))
    }
    try { 
      await fetch(`${API_URL}/api/prospects/${id}/statut`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut: statutFinal }) 
      }) 
    } catch (e) {}
  }

  const telechargerDocumentPdf = async (prospectId, typeDoc) => {
    if (!prospectId) return;
    setMessageSauvegarde('Génération...');
    try {
      await fetch(`${API_URL}/api/prospects/${prospectId}/facturation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode_facturation: modeFacturation,
          montant_forfait: parseFloat(montantForfait) || 0.0,
          montant_materiel: parseFloat(montantMateriel) || 0.0
        })
      });

      const response = await fetch(`${API_URL}/api/prospects/${prospectId}/document?type_doc=${typeDoc}`);
      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${typeDoc}_${prospectId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMessageSauvegarde('Téléchargé !');
      setTimeout(() => setMessageSauvegarde(''), 2000);
    } catch (err) {
      alert("Erreur génération PDF.");
      setMessageSauvegarde('');
    }
  };

  useEffect(() => {
    if (artisanConnecte?.id) {
      chargerProspects(false)
      chargerProfil()
      const minuteur = setInterval(() => chargerProspects(true), 3000)
      return () => clearInterval(minuteur)
    }
  }, [artisanConnecte])

  useEffect(() => {
    if (prospectSelectionne) {
      setModeFacturation(prospectSelectionne.mode_facturation || 'horaire');
      setMontantForfait(prospectSelectionne.montant_forfait || '');
      setMontantMateriel(prospectSelectionne.montant_materiel || '');
    }
  }, [prospectSelectionne]);

  const envoyerMessage = async (e) => {
    e.preventDefault()
    if (!nouveauMessage.trim() || !artisanConnecte?.id) return
    const texteMessage = nouveauMessage
    const historiqueActuel = [...messages]
    const nouvelHistorique = [...historiqueActuel, { role: 'user', content: texteMessage }]
    setMessages(nouvelHistorique); setNouveauMessage(''); setIaReflechit(true);
    try {
      const reponse = await fetch(`${API_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisan_id: artisanConnecte.id, nouveau_message: texteMessage, historique: historiqueActuel }) })
      const data = await reponse.json()
      setMessages([...nouvelHistorique, { role: 'assistant', content: data?.reponse || "Réponse vide." }])
      chargerProspects(true) 
    } catch (e) {
      setMessages([...nouvelHistorique, { role: 'assistant', content: "Erreur serveur." }])
    } finally { setIaReflechit(false) }
  }

  const getHistoriqueChat = (prospect) => {
    try { return prospect?.historique_chat ? JSON.parse(prospect.historique_chat) : []; } catch (e) { return []; }
  };

  const prospectsAnnee = (prospects || []).filter(p => {
    if (!p.date_creation) return false;
    const anneeP = new Date(p.date_creation.replace(' ', 'T')).getFullYear();
    return anneeP === Number(anneeSelectionnee);
  });

  const prospectsActifs = prospectsAnnee.filter(p => p.statut !== 'archive' && p.statut !== 'annule');
  const prixMoyenDemande = (profil?.tarif_deplacement || 50) + (profil?.tarif_horaire || 60);
  let caEnAttente = prospectsActifs.length * prixMoyenDemande;
  let totalCA = prospectsAnnee.filter(p => p.statut === 'archive').length * prixMoyenDemande;
  
  const factureMoyenne = prospectsAnnee.length > 0 ? Math.round(totalCA / prospectsAnnee.length) : 0;
  const tauxConversion = prospectsAnnee.length > 0 ? Math.round((prospectsAnnee.filter(p => p.statut === 'termine' || p.statut === 'archive').length / prospectsAnnee.length) * 100) : 0;

  const clientsFiltresRecherche = (prospects || []).filter(p => {
    if (p.statut === 'annule' || p.statut === 'archive') return false; 
    const terme = (rechercheClient || '').toLowerCase();
    return (p.nom && p.nom.toLowerCase().includes(terme)) || (p.telephone && p.telephone.toLowerCase().includes(terme)) || (p.adresse && p.adresse.toLowerCase().includes(terme)) || (p.probleme && p.probleme.toLowerCase().includes(terme));
  });

  if (!artisanConnecte) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <Card className="w-full max-w-[480px] bg-[#111827] border-slate-800 shadow-2xl relative z-10 p-6 sm:p-8 rounded-2xl">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="flex justify-center mb-2"><div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-900/50"><Wrench className="w-8 h-8 text-slate-950 font-bold" /></div></div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-white">KraftPilot</CardTitle>
            <CardDescription className="text-slate-400 text-sm">{vueAuth === 'connexion' ? 'Connectez-vous à votre espace' : 'Créez votre espace professionnel'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={vueAuth === 'connexion' ? gererConnexion : gererInscription} className="space-y-5">
              {vueAuth === 'inscription' && ( 
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <Input placeholder="Nom de l'entreprise" className="pl-12 pr-4 bg-[#0a0f1d] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} required />
                </div> 
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="email" placeholder="Adresse e-mail" className="pl-12 pr-4 bg-[#0a0f1d] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="password" placeholder="Mot de passe" className="pl-12 pr-4 bg-[#0a0f1d] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
              </div>
              {erreurAuth && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {erreurAuth}</div>}
              <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold mt-2 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/20">
                {vueAuth === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </Button>
            </form>
            <div className="mt-8 text-center text-xs text-slate-400">
              {vueAuth === 'connexion' ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              <button onClick={() => { setVueAuth(vueAuth === 'connexion' ? 'inscription' : 'connexion'); setErreurAuth(''); }} className="ml-2 text-emerald-400 hover:text-emerald-300 font-semibold underline-offset-4 hover:underline">{vueAuth === 'connexion' ? "Créer un espace" : "Se connecter"}</button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-50 flex font-sans relative overflow-hidden">
      
      {/* MODALE AJOUT MANUEL */}
      {modalAjoutOuvert && (
        <div className="fixed inset-0 bg-[#0a0f1d]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[#111827] border-slate-800 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-500"/> Nouvelle Intervention</CardTitle>
              <Button variant="ghost" onClick={() => setModalAjoutOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={soumettreClientManuel} className="space-y-4">
                <div><label className="text-xs text-slate-400 font-medium">Nom du client</label><Input value={formManuel.nom} onChange={e => setFormManuel({...formManuel, nom: e.target.value})} placeholder="ex: Jean Dupont" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div><label className="text-xs text-slate-400 font-medium">Prestation / Problème</label><Input value={formManuel.probleme} onChange={e => setFormManuel({...formManuel, probleme: e.target.value})} placeholder="ex: Fuite d'eau" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 font-medium">Téléphone</label><Input value={formManuel.telephone} onChange={e => setFormManuel({...formManuel, telephone: e.target.value})} placeholder="06 12 34 56 78" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                  <div><label className="text-xs text-slate-400 font-medium">Statut</label><select value={formManuel.statut} onChange={e => setFormManuel({...formManuel, statut: e.target.value})} className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-md px-3 h-10 text-xs mt-1 outline-none"><option value="nouveau">Nouveau</option><option value="contacte">À relancer</option><option value="planifie">Planifié</option><option value="termine">Terminé</option></select></div>
                </div>
                <div><label className="text-xs text-slate-400 font-medium">Adresse complète</label><Input value={formManuel.adresse} onChange={e => setFormManuel({...formManuel, adresse: e.target.value})} placeholder="12 rue de Paris, 75001 Paris" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div className="pt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalAjoutOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-10 text-xs">Enregistrer</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODALE FICHE CLIENT */}
      {prospectSelectionne && (
        <div className="fixed inset-0 bg-[#0a0f1d]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl h-[85vh] bg-[#111827] border-slate-800 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-slate-800 bg-[#0a0f1d]/50 shrink-0">
              <div className="flex items-center gap-3"><div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Users className="w-5 h-5" /></div><div><CardTitle className="text-xl font-bold text-white">{prospectSelectionne.nom}</CardTitle><CardDescription className="text-xs text-slate-400">Dossier créé le {prospectSelectionne.date_creation}</CardDescription></div></div>
              <Button variant="ghost" onClick={() => setProspectSelectionne(null)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 border-r border-slate-800 p-5 space-y-4 overflow-y-auto bg-[#0a0f1d]/30">
                 <div><h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">État du dossier</h4>
                 <select value={prospectSelectionne.statut} onChange={(e) => changerStatut(prospectSelectionne.id, e.target.value)} className={`w-full text-xs font-medium rounded-lg px-3 py-2.5 border outline-none ${STATUTS_TOUS.find(s => s.valeur === prospectSelectionne.statut)?.couleur}`}>{STATUTS_TOUS.filter(s=>s.valeur!=='archive').map(s => <option key={s.valeur} value={s.valeur} className="bg-[#111827] text-slate-200">{s.label}</option>)}</select></div>
                 <div className="space-y-2 bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 text-xs"><p><span className="text-slate-500">Problème:</span> <span className="text-white font-medium">{prospectSelectionne.probleme}</span></p><p><span className="text-slate-500">Tél:</span> <span className="text-white font-medium">{prospectSelectionne.telephone}</span></p><p><span className="text-slate-500">Adresse:</span> <span className="text-white font-medium">{prospectSelectionne.adresse}</span></p></div>
                 
                 <div className="bg-[#0a0f1d] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                   <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Facturation & Devis</h4>
                   <div><label className="text-[10px] text-slate-400">Mode</label><select value={modeFacturation} onChange={(e) => setModeFacturation(e.target.value)} className="w-full bg-[#111827] border border-slate-700 text-white rounded px-2 py-1.5 text-xs outline-none mt-0.5"><option value="horaire">Horaire</option><option value="forfait">Forfait</option></select></div>
                   {modeFacturation === 'forfait' && <div><label className="text-[10px] text-slate-400">Forfait (€)</label><Input type="number" value={montantForfait} onChange={(e) => setMontantForfait(e.target.value)} className="bg-[#111827] border-slate-700 text-white h-7 text-xs mt-0.5" /></div>}
                   <div><label className="text-[10px] text-slate-400">Matériel (€)</label><Input type="number" value={montantMateriel} onChange={(e) => setMontantMateriel(e.target.value)} className="bg-[#111827] border-slate-700 text-white h-7 text-xs mt-0.5" /></div>
                   <div className="pt-2 flex flex-col gap-1.5">
                     <Button onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'devis')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs h-8 font-semibold"><Download className="w-3 h-3 mr-1" /> Devis PDF</Button>
                     <Button onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'facture')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-8 border border-slate-700"><Download className="w-3 h-3 mr-1" /> Facture PDF</Button>
                     {messageSauvegarde && <span className="text-center text-[10px] text-emerald-400">{messageSauvegarde}</span>}
                   </div>
                 </div>
              </div>
              <div className="w-full md:w-2/3 flex flex-col h-full bg-[#0a0f1d]">
                 <div className="p-3 border-b border-slate-800 bg-[#111827]/60"><h4 className="text-xs font-bold text-slate-400">Historique Assistant IA</h4></div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {getHistoriqueChat(prospectSelectionne).length === 0 ? <div className="text-center text-slate-500 text-xs mt-10">Aucun historique.</div> : getHistoriqueChat(prospectSelectionne).map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-xl p-3 text-xs ${m.role === 'user' ? 'bg-slate-700 text-white' : 'bg-[#111827] border border-slate-800 text-slate-300'}`}><p className="font-bold opacity-50 mb-0.5">{m.role === 'user' ? 'Client' : 'IA'}</p>{m.content}</div></div>))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MENU LATÉRAL UNIQUE */}
      <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col hidden lg:flex z-10 shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30">KP</div>
          <div><h1 className="text-base font-extrabold tracking-tight text-white">KraftPilot</h1><span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Enterprise</span></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-medium">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Pilotage</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><LayoutDashboard className="w-4 h-4" /> Vue d'ensemble</button>
              <button onClick={() => setVueActuelle('finances')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'finances' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Wallet className="w-4 h-4" /> Trésorerie</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Gestion Commerciale</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('crm')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><BarChart3 className="w-4 h-4" /> Tunnel CRM</button>
              <button onClick={() => setVueActuelle('clients')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'clients' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Users className="w-4 h-4" /> Répertoire Clients</button>
              <button onClick={() => setVueActuelle('devis')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><FileText className="w-4 h-4" /> Propositions Devis</button>
              <button onClick={() => setVueActuelle('factures')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><Receipt className="w-4 h-4" /> Facturation</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Paramétrage</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('chat')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><MessageSquare className="w-4 h-4" /> Simulateur Assistant IA</button>
              <button onClick={() => setVueActuelle('reglages')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'reglages' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Settings className="w-4 h-4" /> Configuration</button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/60 bg-[#0a0f1d]/50">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">{artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0) : 'P'}</div>
            <div className="overflow-hidden"><p className="text-xs font-semibold text-white truncate">{artisanConnecte?.nom_entreprise || 'Mon Entreprise'}</p><p className="text-[10px] text-slate-500">Compte Actif</p></div>
          </div>
          <Button onClick={deconnexion} variant="outline" className="w-full bg-transparent border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs h-8"><LogOut className="w-3 h-3 mr-1.5" /> Déconnexion</Button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative z-0 bg-[#0a0f1d]">
        
        {/* TOP BAR AVEC NOTIFICATIONS ET PROFIL INTERACTIFS */}
        <header className="mb-8 flex items-center justify-between gap-4 bg-[#111827]/60 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-sm shadow-md">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <Input placeholder="Recherche rapide (Ctrl + K)..." className="h-10 pl-10 pr-4 bg-[#0a0f1d] border-slate-800 text-white rounded-xl text-xs w-full focus:border-emerald-500" />
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* BOUTON CLOCHE NOTIFICATIONS */}
            <div className="relative">
              <button 
                onClick={() => { setMenuNotifOuvert(!menuNotifOuvert); setMenuProfilOuvert(false); }}
                className="w-10 h-10 rounded-xl bg-[#0a0f1d] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {/* POPUP NOTIFICATIONS */}
              {menuNotifOuvert && (
                <div className="absolute right-0 mt-3 w-80 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => setMenuNotifOuvert(false)}>Tout marquer comme lu</span>
                  </div>
                  <div className="p-6 text-center space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400">Aucune notification pour le moment</p>
                  </div>
                </div>
              )}
            </div>

            {/* BOUTON MODE SOMBRE / LUMINEUX (VISUEL) */}
            <button className="w-10 h-10 rounded-xl bg-[#0a0f1d] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-500/50 transition-all">
              <Moon className="w-4 h-4" />
            </button>

            {/* BOUTON PROFIL / AVATAR */}
            <div className="relative">
              <button 
                onClick={() => { setMenuProfilOuvert(!menuProfilOuvert); setMenuNotifOuvert(false); }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30 cursor-pointer overflow-hidden border border-emerald-400/50"
              >
                {artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0).toUpperCase() : 'P'}
              </button>

              {/* POPUP PROFIL TYPE CLERK / SUPABASE */}
              {menuProfilOuvert && (
                <div className="absolute right-0 mt-3 w-72 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150 text-xs">
                  <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shrink-0">
                      {artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white truncate">{artisanConnecte?.nom_entreprise || 'Mon Entreprise'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{artisanConnecte?.email || 'pro@kraftpilot.com'}</p>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { setVueActuelle('reglages'); setMenuProfilOuvert(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4 text-emerald-400" /> Gérer l'entreprise
                    </button>
                    <button 
                      onClick={() => { setVueActuelle('reglages'); setMenuProfilOuvert(false); }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-400" /> Paramètres du compte
                    </button>
                  </div>

                  <div className="p-2 border-t border-slate-800">
                    <button 
                      onClick={deconnexion} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <SignOut className="w-4 h-4" /> Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setModalAjoutOuvert(true)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-transform active:scale-95 ml-2">
              <Plus className="w-4 h-4" /> Nouvelle intervention
            </Button>
          </div>
        </header>

        {/* VUE TABLEAU DE BORD (DASHBOARD) */}
        {vueActuelle === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Tableau de bord</h2>
                <p className="text-xs text-slate-400 mt-1">Vue d'ensemble de votre activité professionnelle.</p>
              </div>
              
              {/* SÉLECTEUR D'ANNÉE DYNAMIQUE */}
              <div className="flex items-center">
                <select 
                  value={anneeSelectionnee} 
                  onChange={(e) => setAnneeSelectionnee(e.target.value)}
                  className="bg-[#111827] border border-slate-700 text-white text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 shadow-lg cursor-pointer"
                >
                  {anneesDisponibles.map((an) => (
                    <option key={an} value={an}>{an}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* GRILLE DES 4 CARTES FINANCIÈRES PRINCIPALES INTERACTIVES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card onClick={() => setVueActuelle('finances')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">CA Total ({anneeSelectionnee})</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{totalCA}€</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">0 factures payées</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Euro className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('finances')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">CA en Attente</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{caEnAttente}€</h3>
                    <p className="text-[10px] text-blue-400 mt-1">Factures non payées</p>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400"><Clock className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('finances')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Impayés</p>
                    <h3 className="text-2xl font-extrabold text-red-400 mt-1">0€</h3>
                    <p className="text-[10px] text-red-400 mt-1">0 facture(s) en retard</p>
                  </div>
                  <div className="bg-red-500/10 p-2.5 rounded-xl text-red-400"><ShieldAlert className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('crm')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Taux Conversion</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{tauxConversion}%</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">Devis ➔ Facture</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><TrendingUp className="w-5 h-5"/></div>
                </div>
              </Card>
            </div>

            {/* SECONDE LIGNE DE STATS FORMAT TOP CARDS (STYLE UNIFIÉ SANS DÉCALAGE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card onClick={() => setVueActuelle('devis')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Devis créés</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{prospectsAnnee.length}</h3>
                    <p className="text-[10px] text-blue-400 mt-1">Propositions envoyées</p>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400"><FileText className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('factures')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Factures émises</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">0</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">Documents générés</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Receipt className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('clients')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Clients actifs</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">{prospectsActifs.length}</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">En cours de traitement</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Users className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('clients')} className="bg-[#111827] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:scale-[1.02] cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Photos chantier</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">0</h3>
                    <p className="text-[10px] text-purple-400 mt-1">Médias enregistrés</p>
                  </div>
                  <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400"><Package className="w-5 h-5"/></div>
                </div>
              </Card>
            </div>

            {/* SECTION ACTIONS RAPIDES ET PIPELINE CRM (CASES PLEINES ET GÉANTES HAUTEUR PLEINE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PIPELINE CRM INTERACTIF */}
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all hover:border-emerald-500/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400"><Target className="w-5 h-5"/></div>
                    <h3 className="text-sm font-bold text-white">Pipeline CRM</h3>
                  </div>
                  <Button onClick={() => setVueActuelle('crm')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-8">Voir CRM →</Button>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-emerald-400">{caEnAttente}€</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Total pipeline actif</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800"><span className="block text-xs font-bold text-blue-400">{prospectsActifs.length} leads</span></div>
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800"><span className="block text-xs font-bold text-emerald-400">0 devis</span></div>
                  <div className="bg-[#0a0f1d] p-2 rounded-xl border border-slate-800"><span className="block text-xs font-bold text-emerald-400">0 gagnés</span></div>
                </div>
              </Card>

              {/* BOUTONS ACTIONS RAPIDES (GROSSES CASES RECTANGULAIRES GÉANTES REMPLISSANT TOUT) */}
              <div className="lg:col-span-2 bg-[#111827] border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                <h3 className="text-sm font-bold text-white mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button onClick={() => setModalAjoutOuvert(true)} className="bg-[#0a0f1d] hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors"><FileText className="w-6 h-6"/></div>
                    <span>Nouveau devis</span>
                  </Button>
                  <Button onClick={() => setModalAjoutOuvert(true)} className="bg-[#0a0f1d] hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors"><Receipt className="w-6 h-6"/></div>
                    <span>Nouvelle facture</span>
                  </Button>
                  <Button onClick={() => setModalAjoutOuvert(true)} className="bg-[#0a0f1d] hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors"><Users className="w-6 h-6"/></div>
                    <span>Ajouter client</span>
                  </Button>
                  <Button onClick={() => setVueActuelle('clients')} className="bg-[#0a0f1d] hover:bg-slate-800/80 text-slate-200 border border-slate-800/80 h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 transition-colors"><Package className="w-6 h-6"/></div>
                    <span>Photos chantier</span>
                  </Button>
                </div>
              </div>

            </div>

            {/* GRAPHIQUES AVEC ÉCHELLES ET TEXTES LISIBLES EN BLANC */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ÉVOLUTION DU CA AVEC ÉCHELLE */}
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden transition-all hover:border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Évolution du CA ({anneeSelectionnee})</h3>
                  <span className="text-xs font-bold text-emerald-400">Total {totalCA}€</span>
                </div>
                <div className="h-48 relative flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-800">
                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 pr-2">
                    <span>10k€</span>
                    <span>5k€</span>
                    <span>0k€</span>
                  </div>
                  {MOIS_ANNEE.map((mois, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer pl-6"
                      onMouseEnter={() => setHoverIndexCa(idx)}
                      onMouseLeave={() => setHoverIndexCa(null)}
                    >
                      {hoverIndexCa === idx && (
                        <div className="absolute bottom-0 w-[1px] h-full bg-emerald-400/80 z-0"></div>
                      )}
                      <div className={`w-2.5 h-2.5 rounded-full z-10 transition-all ${hoverIndexCa === idx ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-400/20' : 'bg-transparent'}`}></div>
                      
                      {hoverIndexCa === idx && (
                        <div className="absolute bottom-12 z-30 bg-[#162032] border border-slate-700 text-white p-3 rounded-xl shadow-2xl text-xs w-28 text-center animate-in fade-in duration-150">
                          <p className="font-bold text-slate-200 capitalize">{mois}</p>
                          <p className="text-emerald-400 font-extrabold mt-1">CA : 0€</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="absolute bottom-2 left-6 right-0 h-[2px] bg-emerald-500"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 pt-3 pl-6">
                  {MOIS_ANNEE.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              </Card>

              {/* ACTIVITÉ MENSUELLE AVEC ÉCHELLE ET TEXTE BLANC LISIBLE */}
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden transition-all hover:border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Activité mensuelle ({anneeSelectionnee})</h3>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-200"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Factures</span>
                    <span className="flex items-center gap-1.5 text-slate-200"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Devis</span>
                  </div>
                </div>
                <div className="h-48 relative flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-800">
                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-400 pr-2">
                    <span>4</span>
                    <span>2</span>
                    <span>0</span>
                  </div>
                  {MOIS_ANNEE.map((mois, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer pl-6"
                      onMouseEnter={() => setHoverIndexAct(idx)}
                      onMouseLeave={() => setHoverIndexAct(null)}
                    >
                      {hoverIndexAct === idx && (
                        <div className="absolute bottom-0 w-6 h-full bg-slate-700/40 rounded-t z-0"></div>
                      )}
                      
                      {hoverIndexAct === idx && (
                        <div className="absolute bottom-12 z-30 bg-[#162032] border border-slate-700 text-white p-3 rounded-xl shadow-2xl text-xs w-32 text-left animate-in fade-in duration-150">
                          <p className="font-bold text-slate-200 capitalize mb-1">{mois}</p>
                          <p className="text-blue-400 font-semibold">Devis : 0</p>
                          <p className="text-emerald-400 font-semibold mt-0.5">Factures : 0</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 pt-3 pl-6">
                  {MOIS_ANNEE.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              </Card>

            </div>

            {/* SECTION TOP 5 CLIENTS & RÉPARTITION DES DEVIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl h-64 flex flex-col justify-between transition-all hover:border-emerald-500/30">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500"/><h3 className="text-sm font-bold text-white">Top 5 clients ({anneeSelectionnee})</h3></div>
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              </Card>
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl h-64 flex flex-col justify-between transition-all hover:border-emerald-500/30">
                <div className="flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-500"/><h3 className="text-sm font-bold text-white">Répartition des devis ({anneeSelectionnee})</h3></div>
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              </Card>
            </div>

            {/* SECTION INDICATEURS CLÉS FINAUX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card onClick={() => setVueActuelle('factures')} className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer">
                <p className="text-xs text-slate-400 font-medium">Facture moyenne</p>
                <h4 className="text-3xl font-black text-emerald-400 mt-2">{factureMoyenne}€</h4>
              </Card>
              <Card onClick={() => setVueActuelle('crm')} className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer">
                <p className="text-xs text-slate-400 font-medium">Taux de conversion</p>
                <h4 className="text-3xl font-black text-emerald-400 mt-2">{tauxConversion}%</h4>
              </Card>
              <Card onClick={() => setVueActuelle('clients')} className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer">
                <p className="text-xs text-slate-400 font-medium">Clients actifs</p>
                <h4 className="text-3xl font-black text-blue-400 mt-2">{prospectsActifs.length}</h4>
              </Card>
            </div>

          </div>
        )}

        {/* VUE CLIENTS / RÉPERTOIRE */}
        {vueActuelle === 'clients' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div><h2 className="text-2xl font-black text-white tracking-tight">Répertoire Clients</h2><p className="text-xs text-slate-400 mt-1">Gérez vos fiches clients et éditez vos documents.</p></div>
              <Button onClick={() => setModalAjoutOuvert(true)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl"><Plus className="w-4 h-4 mr-2"/> Ajouter</Button>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="bg-[#0a0f1d] text-slate-300 uppercase font-semibold border-b border-slate-800">
                  <tr><th className="px-5 py-3.5">Client</th><th className="px-5 py-3.5">Contact</th><th className="px-5 py-3.5 hidden md:table-cell">Prestation</th><th className="px-5 py-3.5">Statut</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientsFiltresRecherche.map(p => {
                    const infosStatut = STATUTS_TOUS.find(s => s.valeur === p.statut) || STATUTS_TOUS[0];
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">{p.nom}</td>
                        <td className="px-5 py-3.5">{p.telephone}</td>
                        <td className="px-5 py-3.5 hidden md:table-cell truncate max-w-[200px]">{p.probleme}</td>
                        <td className="px-5 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[10px] border ${infosStatut.couleur}`}>{infosStatut.label}</span></td>
                        <td className="px-5 py-3.5 text-right"><Button onClick={() => setProspectSelectionne(p)} size="sm" variant="outline" className="h-7 bg-transparent border-slate-700 text-xs text-slate-200 hover:bg-slate-800"><Eye className="w-3 h-3 mr-1"/> Dossier</Button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VUE RÉGLAGES PROFIL */}
        {vueActuelle === 'reglages' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div><h2 className="text-2xl font-black text-white tracking-tight">Configuration de l'entreprise</h2><p className="text-xs text-slate-400 mt-1">Paramétrez vos tarifs et le comportement de l'assistant.</p></div>
            <form onSubmit={sauvegarderProfil} className="space-y-6">
              <Card className="bg-[#111827] border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-500"/> Identité Pro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="text-slate-400">Entreprise</label><Input value={profil.nom_entreprise || ''} onChange={(e) => setProfil({...profil, nom_entreprise: e.target.value})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Métier</label><Input value={profil.metier || ''} onChange={(e) => setProfil({...profil, metier: e.target.value})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Téléphone</label><Input value={profil.telephone || ''} onChange={(e) => setProfil({...profil, telephone: e.target.value})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" /></div>
                  <div><label className="text-slate-400">Adresse</label><Input value={profil.adresse || ''} onChange={(e) => setProfil({...profil, adresse: e.target.value})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" /></div>
                </div>
              </Card>

              <Card className="bg-[#111827] border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Euro className="w-4 h-4 text-emerald-500"/> Grille Tarifaire</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="text-slate-400">Frais de déplacement (€)</label><Input type="number" step="0.01" value={profil.tarif_deplacement || 0} onChange={(e) => setProfil({...profil, tarif_deplacement: parseFloat(e.target.value) || 0})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Taux horaire (€/h)</label><Input type="number" step="0.01" value={profil.tarif_horaire || 0} onChange={(e) => setProfil({...profil, tarif_horaire: parseFloat(e.target.value) || 0})} className="bg-[#0a0f1d] border-slate-700 text-white h-9 mt-1" required /></div>
                </div>
              </Card>

              <div className="flex items-center gap-4"><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl"><Save className="w-4 h-4 mr-2"/> Enregistrer</Button>{messageSauvegarde && <span className="text-xs text-emerald-400 font-medium">{messageSauvegarde}</span>}</div>
            </form>
          </div>
        )}

        {/* VUE CHATBOT TEST */}
        {vueActuelle === 'chat' && (
          <div className="max-w-2xl mx-auto h-[75vh] flex flex-col animate-in fade-in duration-300">
            <div className="mb-4"><h2 className="text-2xl font-black text-white tracking-tight">Simulateur Assistant IA</h2><p className="text-xs text-slate-400 mt-1">Testez les réponses automatiques de votre agent virtuel.</p></div>
            <Card className="flex-1 bg-[#111827] border-slate-800 flex flex-col overflow-hidden rounded-2xl shadow-xl">
              <CardContent className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
                {messages.map((m, idx) => (<div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-xl p-3 text-xs ${m.role === 'user' ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-[#0a0f1d] border border-slate-800 text-slate-300'}`}>{m.content}</div></div>))}
                {iaReflechit && <div className="text-xs text-slate-500 animate-pulse">L'assistant rédige sa réponse...</div>}
              </CardContent>
              <div className="p-3 border-t border-slate-800 bg-[#0a0f1d]">
                <form onSubmit={envoyerMessage} className="flex gap-2"><Input value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)} placeholder="Simuler un message client..." className="flex-1 bg-[#111827] border-slate-700 text-white h-10 text-xs" /><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 h-10 px-4 text-xs font-bold"><Send className="w-3.5 h-3.5"/></Button></form>
              </div>
            </Card>
          </div>
        )}

        {/* VUES EN ATTENTE */}
        {['finances', 'crm', 'devis', 'factures'].includes(vueActuelle) && (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg"><Wrench className="w-8 h-8"/></div>
            <h3 className="text-xl font-bold text-white capitalize">Module {vueActuelle}</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-2">Cette option sera synchronisée lors de la mise en production globale.</p>
            <Button onClick={() => setVueActuelle('dashboard')} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9">Retour au Dashboard</Button>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
