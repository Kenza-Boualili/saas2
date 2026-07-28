import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, MessageSquare, AlertCircle, Wrench, Phone, MapPin, CheckCircle2, Send, Filter, LogOut, Lock, Mail, Building2, Calendar, Clock, CalendarDays, Download, Archive, FileText, Settings, Save, Euro, Map, Users, Search, PhoneCall, Eye, X, BellRing, BarChart3, TrendingUp, PieChart, Bot, Plus, Wallet, FileSpreadsheet, Receipt, Truck, ShoppingCart, Package, CalendarCheck, HelpCircle, MessageCircle } from "lucide-react"

const API_URL = "https://artisan-ai-zirt.onrender.com";

const STATUTS_TOUS = [
  { valeur: 'nouveau', label: 'Nouveau', couleur: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { valeur: 'contacte', label: 'À relancer', couleur: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { valeur: 'planifie', label: 'Planifié', couleur: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { valeur: 'termine', label: 'Terminé', couleur: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { valeur: 'annule', label: 'Annulé', couleur: 'bg-red-500/10 text-red-400 border-red-500/30' },
  { valeur: 'archive', label: 'Archivé', couleur: 'bg-slate-800/50 text-slate-500 border-slate-700/50' },
]

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
  const [filtreStatut, setFiltreStatut] = useState('actifs')
  const [rechercheClient, setRechercheClient] = useState('')
  const [prospectSelectionne, setProspectSelectionne] = useState(null)

  // États pour les options de facturation modulaires
  const [modeFacturation, setModeFacturation] = useState('horaire')
  const [montantForfait, setMontantForfait] = useState('')
  const [montantMateriel, setMontantMateriel] = useState('')

  // État pour la modale d'ajout manuel
  const [modalAjoutOuvert, setModalAjoutOuvert] = useState(false)
  const [formManuel, setFormManuel] = useState({
    nom: '', probleme: '', telephone: '', adresse: '', statut: 'nouveau', date_intervention: '', urgent: 'non'
  })

  const dernierIdVuRef = useRef(null)
  const [alerteToast, setAlerteToast] = useState(null)

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
      if (data.success) connecterUtilisateur(data.artisan_id, data.nom_entreprise)
      else setErreurAuth(data.erreur)
    } catch (err) { setErreurAuth("Erreur serveur.") }
  }

  const gererConnexion = async (e) => {
    e.preventDefault(); setErreurAuth('')
    try {
      const res = await fetch(`${API_URL}/api/connexion`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, mot_de_passe: motDePasse }) })
      const data = await res.json()
      if (data.success) connecterUtilisateur(data.artisan_id, data.nom_entreprise)
      else setErreurAuth(data.erreur)
    } catch (err) { setErreurAuth("Erreur serveur.") }
  }

  const connecterUtilisateur = (id, nom) => {
    setArtisanConnecte({ id, nom_entreprise: nom })
    setMessages([{ role: 'assistant', content: `Bonjour ! Je suis l'assistant de l'entreprise ${nom}. Quel est votre besoin aujourd'hui ?` }])
    setEmail(''); setMotDePasse(''); setNomEntreprise('');
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }

  const deconnexion = () => {
    setArtisanConnecte(null); setProspects([]); setVueActuelle('dashboard'); dernierIdVuRef.current = null;
  }

  const declencherNotification = (prospect) => {
    setAlerteToast(prospect);
    setTimeout(() => setAlerteToast(null), 8000);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Nouvelle demande : ${prospect.nom}`, {
        body: `Besoin : ${prospect.probleme}\nTél : ${prospect.telephone}`,
        icon: "https://cdn-icons-png.flaticon.com/512/1055/1055685.png"
      });
    }
  }

  const chargerProspects = (silencieux = false) => {
    if (!artisanConnecte) return
    if (!silencieux) setChargement(true)
    fetch(`${API_URL}/api/prospects?artisan_id=${artisanConnecte.id}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => { 
        const liste = data.prospects || [];
        if (liste.length > 0) {
          const maxId = Math.max(...liste.map(p => p.id));
          if (dernierIdVuRef.current !== null && maxId > dernierIdVuRef.current) {
            const nouveau = liste.find(p => p.id === maxId);
            if (nouveau) declencherNotification(nouveau);
          }
          dernierIdVuRef.current = maxId;
        }
        setProspects(liste); 
        setChargement(false) 
      })
      .catch(err => setChargement(false))
  }

  const chargerProfil = async () => {
    if (!artisanConnecte) return
    try {
      const res = await fetch(`${API_URL}/api/artisans/${artisanConnecte.id}/profil`)
      const data = await res.json()
      if (data.nom_entreprise) setProfil(data)
    } catch (err) {}
  }

  const sauvegarderProfil = async (e) => {
    e.preventDefault(); setMessageSauvegarde('Sauvegarde en cours...')
    try {
      await fetch(`${API_URL}/api/artisans/${artisanConnecte.id}/profil`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profil) })
      setMessageSauvegarde('Profil mis à jour avec succès.')
      setArtisanConnecte(prev => ({ ...prev, nom_entreprise: profil.nom_entreprise }))
      setTimeout(() => setMessageSauvegarde(''), 3000)
    } catch (erreur) {
      setMessageSauvegarde('Erreur lors de la sauvegarde.')
      setTimeout(() => setMessageSauvegarde(''), 3000)
    }
  }

  const soumettreClientManuel = async (e) => {
    e.preventDefault();
    if (!artisanConnecte) return;
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
      alert("Erreur lors de l'enregistrement de l'intervention.");
    }
  }

  const changerStatut = async (id, nouveauStatut) => {
    const statutFinal = nouveauStatut === 'termine' ? 'archive' : nouveauStatut;
    setProspects(prospectsActuels => prospectsActuels.map(p => p.id === id ? { ...p, statut: statutFinal } : p))
    if (prospectSelectionne && prospectSelectionne.id === id) {
      if (statutFinal === 'archive') {
        setProspectSelectionne(null);
      } else {
        setProspectSelectionne(prev => ({...prev, statut: statutFinal}))
      }
    }
    try { 
      await fetch(`${API_URL}/api/prospects/${id}/statut`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ statut: statutFinal }) 
      }) 
    } catch (erreur) {}
  }

  const fixerRendezVous = async (id, dateStr) => {
    setProspects(prospectsActuels => prospectsActuels.map(p => p.id === id ? { ...p, date_intervention: dateStr } : p))
    if (prospectSelectionne && prospectSelectionne.id === id) setProspectSelectionne(prev => ({...prev, date_intervention: dateStr}))
    try { await fetch(`${API_URL}/api/prospects/${id}/rendezvous`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date_intervention: dateStr }) }) } catch (erreur) {}
  }

  const telechargerDocumentPdf = async (prospectId, typeDoc) => {
    if (!prospectId) { alert("Veuillez sélectionner un client valide."); return; }
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
      if (!response.ok) throw new Error(`Erreur serveur (${response.status})`);

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
      alert("Erreur lors du téléchargement du document PDF.");
      setMessageSauvegarde('');
    }
  };

  useEffect(() => {
    if (artisanConnecte) {
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
    if (!nouveauMessage.trim() || !artisanConnecte) return
    const texteMessage = nouveauMessage
    const historiqueActuel = [...messages]
    const nouvelHistorique = [...historiqueActuel, { role: 'user', content: texteMessage }]
    setMessages(nouvelHistorique); setNouveauMessage(''); setIaReflechit(true);
    try {
      const reponse = await fetch(`${API_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artisan_id: artisanConnecte.id, nouveau_message: texteMessage, historique: historiqueActuel }) })
      const data = await reponse.json()
      setMessages([...nouvelHistorique, { role: 'assistant', content: data.reponse }])
      chargerProspects(true) 
    } catch (erreur) {
      setMessages([...nouvelHistorique, { role: 'assistant', content: "Erreur serveur." }])
    } finally { setIaReflechit(false) }
  }

  const getHistoriqueChat = (prospect) => {
    try { return prospect.historique_chat ? JSON.parse(prospect.historique_chat) : []; } catch (e) { return []; }
  };

  const maintenant = new Date();
  const anneeActuelle = maintenant.getFullYear();
  const debutAujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()).getTime();
  const debutSemaine = debutAujourdhui - (7 * 24 * 60 * 60 * 1000); 
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).getTime();

  let statsAujourdhui = 0; let statsSemaine = 0; let statsMois = 0;
  const prixMoyenDemande = (profil.tarif_deplacement || 50) + (profil.tarif_horaire || 60);
  let caEncaisse = 0; let caPrevisionnel = 0; let caEnAttente = 0;

  prospects.forEach(p => {
    if (!p.date_creation || p.statut === 'annule') return; 
    const dateP = new Date(p.date_creation.replace(' ', 'T'));
    const timeP = dateP.getTime();
    if (timeP >= debutAujourdhui) statsAujourdhui++;
    if (timeP >= debutSemaine) statsSemaine++;
    if (timeP >= debutMois) statsMois++;
    if (dateP.getFullYear() === anneeActuelle) {
      if (p.statut === 'archive') caEncaisse += prixMoyenDemande;
      else if (p.statut === 'planifie') caPrevisionnel += prixMoyenDemande;
      else caEnAttente += prixMoyenDemande;
    }
  });

  const totalCA = caEncaisse + caPrevisionnel + caEnAttente;
  const prospectsActifs = prospects.filter(p => p.statut !== 'archive' && p.statut !== 'annule');
  const clientsFiltresRecherche = prospects.filter(p => {
    if (p.statut === 'annule' || p.statut === 'archive') return false; 
    const terme = rechercheClient.toLowerCase();
    return (p.nom && p.nom.toLowerCase().includes(terme)) || (p.telephone && p.telephone.toLowerCase().includes(terme)) || (p.adresse && p.adresse.toLowerCase().includes(terme)) || (p.probleme && p.probleme.toLowerCase().includes(terme));
  });

  const prospectsFiltres = prospectsActifs.filter(p => {
    if (filtreStatut === 'tous') return true;
    if (filtreStatut === 'actifs') return p.statut !== 'termine';
    return p.statut === filtreStatut;
  }).sort((a, b) => b.id - a.id);

  if (!artisanConnecte) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        <Card className="w-full max-w-[480px] bg-[#131b2e] border-slate-800 shadow-2xl relative z-10 p-6 sm:p-8 rounded-2xl">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="flex justify-center mb-2"><div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-900/50"><Wrench className="w-8 h-8 text-slate-950 font-bold" /></div></div>
            <CardTitle className="text-3xl font-extrabold tracking-tight text-white">BatiSmart</CardTitle>
            <CardDescription className="text-slate-400 text-sm">{vueAuth === 'connexion' ? 'Accédez à votre espace de pilotage' : 'Créez votre espace professionnel'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={vueAuth === 'connexion' ? gererConnexion : gererInscription} className="space-y-5">
              {vueAuth === 'inscription' && ( 
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <Input placeholder="Nom de l'entreprise" className="pl-12 pr-4 bg-[#0b0f19] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} required />
                </div> 
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="email" placeholder="Adresse e-mail" className="pl-12 pr-4 bg-[#0b0f19] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="password" placeholder="Mot de passe" className="pl-12 pr-4 bg-[#0b0f19] border-slate-700 h-12 text-white rounded-xl text-sm focus:border-emerald-500" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-50 flex font-sans relative overflow-hidden">
      
      {/* 🔔 TOAST NOTIFICATION */}
      {alerteToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-slate-950 font-semibold p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-8 duration-500 border border-emerald-400/50 min-w-[280px]">
          <div className="bg-slate-950/10 p-2 rounded-full shrink-0"><BellRing className="w-5 h-5 animate-pulse text-slate-950" /></div>
          <div className="flex-1">
            <h4 className="font-bold text-sm flex items-center justify-between">Nouveau prospect !<button onClick={() => setAlerteToast(null)} className="text-slate-950 hover:text-white p-1 rounded-full"><X className="w-4 h-4"/></button></h4>
            <p className="text-xs mt-0.5">{alerteToast.nom} - {alerteToast.probleme}</p>
          </div>
        </div>
      )}

      {/* ➕ MODALE AJOUT MANUEL */}
      {modalAjoutOuvert && (
        <div className="fixed inset-0 bg-[#0b0f19]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-[#131b2e] border-slate-800 shadow-2xl rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-500"/> Ajouter une intervention</CardTitle>
              <Button variant="ghost" onClick={() => setModalAjoutOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={soumettreClientManuel} className="space-y-4">
                <div><label className="text-xs text-slate-400 font-medium">Nom du client</label><Input value={formManuel.nom} onChange={e => setFormManuel({...formManuel, nom: e.target.value})} placeholder="ex: Jean Dupont" className="bg-[#0b0f19] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div><label className="text-xs text-slate-400 font-medium">Problème / Prestation</label><Input value={formManuel.probleme} onChange={e => setFormManuel({...formManuel, probleme: e.target.value})} placeholder="ex: Fuite d'eau" className="bg-[#0b0f19] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 font-medium">Téléphone</label><Input value={formManuel.telephone} onChange={e => setFormManuel({...formManuel, telephone: e.target.value})} placeholder="06 12 34 56 78" className="bg-[#0b0f19] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                  <div><label className="text-xs text-slate-400 font-medium">Statut</label><select value={formManuel.statut} onChange={e => setFormManuel({...formManuel, statut: e.target.value})} className="w-full bg-[#0b0f19] border border-slate-700 text-white rounded-md px-3 h-10 text-xs mt-1 outline-none"><option value="nouveau">Nouveau</option><option value="contacte">À relancer</option><option value="planifie">Planifié</option><option value="termine">Terminé</option></select></div>
                </div>
                <div><label className="text-xs text-slate-400 font-medium">Adresse complète</label><Input value={formManuel.adresse} onChange={e => setFormManuel({...formManuel, adresse: e.target.value})} placeholder="12 rue de Paris, 75001 Paris" className="bg-[#0b0f19] border-slate-700 text-white h-10 text-sm mt-1" required /></div>
                <div className="pt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalAjoutOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-10 text-xs">Enregistrer</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🗂️ MODALE FICHE CLIENT */}
      {prospectSelectionne && (
        <div className="fixed inset-0 bg-[#0b0f19]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl h-[85vh] bg-[#131b2e] border-slate-800 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-slate-800 bg-[#0b0f19]/50 shrink-0">
              <div className="flex items-center gap-3"><div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Users className="w-5 h-5" /></div><div><CardTitle className="text-xl font-bold text-white">{prospectSelectionne.nom}</CardTitle><CardDescription className="text-xs text-slate-400">Dossier créé le {prospectSelectionne.date_creation}</CardDescription></div></div>
              <Button variant="ghost" onClick={() => setProspectSelectionne(null)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-5 h-5" /></Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 border-r border-slate-800 p-5 space-y-4 overflow-y-auto bg-[#0b0f19]/30">
                 <div><h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">État du dossier</h4>
                 <select value={prospectSelectionne.statut} onChange={(e) => changerStatut(prospectSelectionne.id, e.target.value)} className={`w-full text-xs font-medium rounded-lg px-3 py-2.5 border outline-none ${STATUTS_TOUS.find(s => s.valeur === prospectSelectionne.statut)?.couleur}`}>{STATUTS_TOUS.filter(s=>s.valeur!=='archive').map(s => <option key={s.valeur} value={s.valeur} className="bg-[#131b2e] text-slate-200">{s.label}</option>)}</select></div>
                 <div className="space-y-2 bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 text-xs"><p><span className="text-slate-500">Problème:</span> <span className="text-white font-medium">{prospectSelectionne.probleme}</span></p><p><span className="text-slate-500">Tél:</span> <span className="text-white font-medium">{prospectSelectionne.telephone}</span></p><p><span className="text-slate-500">Adresse:</span> <span className="text-white font-medium">{prospectSelectionne.adresse}</span></p></div>
                 
                 <div className="bg-[#0b0f19] p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                   <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Facturation & Devis</h4>
                   <div><label className="text-[10px] text-slate-400">Mode</label><select value={modeFacturation} onChange={(e) => setModeFacturation(e.target.value)} className="w-full bg-[#131b2e] border border-slate-700 text-white rounded px-2 py-1.5 text-xs outline-none mt-0.5"><option value="horaire">Horaire</option><option value="forfait">Forfait</option></select></div>
                   {modeFacturation === 'forfait' && <div><label className="text-[10px] text-slate-400">Forfait (€)</label><Input type="number" value={montantForfait} onChange={(e) => setMontantForfait(e.target.value)} className="bg-[#131b2e] border-slate-700 text-white h-7 text-xs mt-0.5" /></div>}
                   <div><label className="text-[10px] text-slate-400">Matériel (€)</label><Input type="number" value={montantMateriel} onChange={(e) => setMontantMateriel(e.target.value)} className="bg-[#131b2e] border-slate-700 text-white h-7 text-xs mt-0.5" /></div>
                   <div className="pt-2 flex flex-col gap-1.5">
                     <Button onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'devis')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs h-8 font-semibold"><Download className="w-3 h-3 mr-1" /> Devis PDF</Button>
                     <Button onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'facture')} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-8 border border-slate-700"><Download className="w-3 h-3 mr-1" /> Facture PDF</Button>
                     {messageSauvegarde && <span className="text-center text-[10px] text-emerald-400">{messageSauvegarde}</span>}
                   </div>
                 </div>
              </div>
              <div className="w-full md:w-2/3 flex flex-col h-full bg-[#0b0f19]">
                 <div className="p-3 border-b border-slate-800 bg-[#131b2e]/60"><h4 className="text-xs font-bold text-slate-400">Historique Assistant IA</h4></div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {getHistoriqueChat(prospectSelectionne).length === 0 ? <div className="text-center text-slate-500 text-xs mt-10">Aucun historique.</div> : getHistoriqueChat(prospectSelectionne).map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-xl p-3 text-xs ${m.role === 'user' ? 'bg-slate-700 text-white' : 'bg-[#131b2e] border border-slate-800 text-slate-300'}`}><p className="font-bold opacity-50 mb-0.5">{m.role === 'user' ? 'Client' : 'IA'}</p>{m.content}</div></div>))}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🧭 MENU LATÉRAL (STYLE IDENTIQUE AU CONCURRENT MAIS DESIGN UNIQUE) */}
      <aside className="w-64 bg-[#0d1322] border-r border-slate-800/80 flex flex-col hidden lg:flex z-10 shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30">BS</div>
          <div><h1 className="text-base font-extrabold tracking-tight text-white">BatiSmart</h1><span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Pro Edition</span></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-medium">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Tableau de bord</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
              <button onClick={() => setVueActuelle('finances')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'finances' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Wallet className="w-4 h-4" /> Finances</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Gestion</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('crm')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><BarChart3 className="w-4 h-4" /> CRM</button>
              <button onClick={() => setVueActuelle('clients')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'clients' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Users className="w-4 h-4" /> Clients</button>
              <button onClick={() => setVueActuelle('devis')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><FileText className="w-4 h-4" /> Devis</button>
              <button onClick={() => setVueActuelle('factures')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><Receipt className="w-4 h-4" /> Factures</button>
              <button onClick={() => setVueActuelle('avoirs')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><FileSpreadsheet className="w-4 h-4" /> Avoirs</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Approvisionnement</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('fournisseurs')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><Truck className="w-4 h-4" /> Fournisseurs</button>
              <button onClick={() => setVueActuelle('commandes')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><ShoppingCart className="w-4 h-4" /> Commandes</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Organisation</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('catalogue')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><Package className="w-4 h-4" /> Catalogue</button>
              <button onClick={() => setVueActuelle('planning')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><CalendarCheck className="w-4 h-4" /> Planning</button>
              <button onClick={() => setVueActuelle('chat')} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white"><MessageSquare className="w-4 h-4" /> Chatbot Client</button>
              <button onClick={() => setVueActuelle('reglages')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'reglages' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}><Settings className="w-4 h-4" /> Réglages</button>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/60 bg-[#0b0f19]/50">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase">{artisanConnecte.nom_entreprise.charAt(0)}</div>
            <div className="overflow-hidden"><p className="text-xs font-semibold text-white truncate">{artisanConnecte.nom_entreprise}</p><p className="text-[10px] text-slate-500">Compte Pro</p></div>
          </div>
          <Button onClick={deconnexion} variant="outline" className="w-full bg-transparent border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs h-8"><LogOut className="w-3 h-3 mr-1.5" /> Déconnexion</Button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto relative z-0 bg-[#0b0f19]">
        
        {/* TOP BAR STYLE CONCURRENT */}
        <header className="mb-8 flex items-center justify-between gap-4 bg-[#131b2e]/60 p-4 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <Input placeholder="Rechercher (Ctrl + K)..." className="h-10 pl-10 pr-4 bg-[#0b0f19] border-slate-800 text-white rounded-xl text-xs w-full focus:border-emerald-500" />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setModalAjoutOuvert(true)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouvelle intervention
            </Button>
          </div>
        </header>

        {/* VUE TABLEAU DE BORD (DASHBOARD) */}
        {vueActuelle === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Tableau de bord</h2>
              <p className="text-xs text-slate-400 mt-1">Vue d'ensemble de votre activité pour {anneeActuelle}.</p>
            </div>

            {/* BLOCS STATISTIQUES PRINCIPAUX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#131b2e] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden">
                <div className="flex justify-between items-start"><div><p className="text-xs text-slate-400 font-medium">CA Total</p><h3 className="text-2xl font-extrabold text-white mt-1">{totalCA}€</h3><p className="text-[10px] text-emerald-400 mt-1">Chiffre d'affaires global</p></div><div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400"><Euro className="w-5 h-5"/></div></div>
              </Card>
              <Card className="bg-[#131b2e] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden">
                <div className="flex justify-between items-start"><div><p className="text-xs text-slate-400 font-medium">CA en Attente</p><h3 className="text-2xl font-extrabold text-white mt-1">{caEnAttente}€</h3><p className="text-[10px] text-amber-400 mt-1">Devis & prospects actifs</p></div><div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400"><Clock className="w-5 h-5"/></div></div>
              </Card>
              <Card className="bg-[#131b2e] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden">
                <div className="flex justify-between items-start"><div><p className="text-xs text-slate-400 font-medium">Demandes du mois</p><h3 className="text-2xl font-extrabold text-white mt-1">{statsMois}</h3><p className="text-[10px] text-blue-400 mt-1">Depuis le 1er du mois</p></div><div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-400"><Calendar className="w-5 h-5"/></div></div>
              </Card>
              <Card className="bg-[#131b2e] border-slate-800 shadow-xl rounded-2xl p-5 relative overflow-hidden">
                <div className="flex justify-between items-start"><div><p className="text-xs text-slate-400 font-medium">Clients Actifs</p><h3 className="text-2xl font-extrabold text-white mt-1">{prospectsActifs.length}</h3><p className="text-[10px] text-emerald-400 mt-1">Dossiers en cours</p></div><div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400"><Users className="w-5 h-5"/></div></div>
              </Card>
            </div>

            {/* LISTE DES PROSPECTS RÉCENTS */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-emerald-500"/> Interventions & Prospects récents</h3>
                <Button onClick={() => setVueActuelle('clients')} variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300">Voir tout</Button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {prospectsActifs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">Aucune intervention active pour le moment.</div>
                ) : (
                  prospectsActifs.slice(0, 5).map(p => {
                    const infosStatut = STATUTS_TOUS.find(s => s.valeur === p.statut) || STATUTS_TOUS[0];
                    return (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">{p.nom ? p.nom.charAt(0) : 'C'}</div>
                          <div><h4 className="text-xs font-bold text-white">{p.nom}</h4><p className="text-[11px] text-slate-400">{p.probleme}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${infosStatut.couleur}`}>{infosStatut.label}</span>
                          <Button onClick={() => setProspectSelectionne(p)} size="sm" variant="outline" className="h-7 bg-transparent border-slate-700 text-xs text-slate-300 hover:bg-slate-800"><Eye className="w-3 h-3 mr-1"/> Ouvrir</Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
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
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="bg-[#0b0f19] text-slate-300 uppercase font-semibold border-b border-slate-800">
                  <tr><th className="px-5 py-3.5">Client</th><th className="px-5 py-3.5">Contact</th><th className="px-5 py-3.5 hidden md:table-cell">Problème</th><th className="px-5 py-3.5">Statut</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
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
            <div><h2 className="text-2xl font-black text-white tracking-tight">Paramètres de l'entreprise</h2><p className="text-xs text-slate-400 mt-1">Configurez votre grille tarifaire et votre assistant IA.</p></div>
            <form onSubmit={sauvegarderProfil} className="space-y-6">
              <Card className="bg-[#131b2e] border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-500"/> Identité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="text-slate-400">Entreprise</label><Input value={profil.nom_entreprise || ''} onChange={(e) => setProfil({...profil, nom_entreprise: e.target.value})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Métier</label><Input value={profil.metier || ''} onChange={(e) => setProfil({...profil, metier: e.target.value})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Téléphone</label><Input value={profil.telephone || ''} onChange={(e) => setProfil({...profil, telephone: e.target.value})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" /></div>
                  <div><label className="text-slate-400">Adresse</label><Input value={profil.adresse || ''} onChange={(e) => setProfil({...profil, adresse: e.target.value})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" /></div>
                </div>
              </Card>

              <Card className="bg-[#131b2e] border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Euro className="w-4 h-4 text-emerald-500"/> Tarification par défaut</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="text-slate-400">Frais de déplacement (€)</label><Input type="number" step="0.01" value={profil.tarif_deplacement || 0} onChange={(e) => setProfil({...profil, tarif_deplacement: parseFloat(e.target.value) || 0})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" required /></div>
                  <div><label className="text-slate-400">Taux horaire (€/h)</label><Input type="number" step="0.01" value={profil.tarif_horaire || 0} onChange={(e) => setProfil({...profil, tarif_horaire: parseFloat(e.target.value) || 0})} className="bg-[#0b0f19] border-slate-700 text-white h-9 mt-1" required /></div>
                </div>
              </Card>

              <div className="flex items-center gap-4"><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl"><Save className="w-4 h-4 mr-2"/> Enregistrer</Button>{messageSauvegarde && <span className="text-xs text-emerald-400 font-medium">{messageSauvegarde}</span>}</div>
            </form>
          </div>
        )}

        {/* VUE CHATBOT TEST */}
        {vueActuelle === 'chat' && (
          <div className="max-w-2xl mx-auto h-[75vh] flex flex-col animate-in fade-in duration-300">
            <div className="mb-4"><h2 className="text-2xl font-black text-white tracking-tight">Simulateur Chatbot</h2><p className="text-xs text-slate-400 mt-1">Testez les réponses de votre assistant virtuel en direct.</p></div>
            <Card className="flex-1 bg-[#131b2e] border-slate-800 flex flex-col overflow-hidden rounded-2xl shadow-xl">
              <CardContent className="flex-1 p-5 overflow-y-auto flex flex-col gap-3">
                {messages.map((m, idx) => (<div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-xl p-3 text-xs ${m.role === 'user' ? 'bg-emerald-500 text-slate-950 font-medium' : 'bg-[#0b0f19] border border-slate-800 text-slate-300'}`}>{m.content}</div></div>))}
                {iaReflechit && <div className="text-xs text-slate-500 animate-pulse">L'assistant réfléchit...</div>}
              </CardContent>
              <div className="p-3 border-t border-slate-800 bg-[#0b0f19]">
                <form onSubmit={envoyerMessage} className="flex gap-2"><Input value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)} placeholder="Écrivez un message..." className="flex-1 bg-[#131b2e] border-slate-700 text-white h-10 text-xs" /><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 h-10 px-4 text-xs font-bold"><Send className="w-3.5 h-3.5"/></Button></form>
              </div>
            </Card>
          </div>
        )}

        {/* VUES EN ATTENTE (FINANCES, CRM, DEVIS, FACTURES, ETC.) */}
        {['finances', 'crm', 'devis', 'factures', 'avoirs', 'fournisseurs', 'commandes', 'catalogue', 'planning'].includes(vueActuelle) && (
          <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-lg"><Wrench className="w-8 h-8"/></div>
            <h3 className="text-xl font-bold text-white capitalize">Module {vueActuelle}</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-2">Cette fonctionnalité sera bientôt disponible dans la prochaine mise à jour de votre plateforme.</p>
            <Button onClick={() => setVueActuelle('dashboard')} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white text-xs h-9">Retour au Dashboard</Button>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
