import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, MessageSquare, AlertCircle, Wrench, Phone, MapPin, CheckCircle2, Send, Filter, LogOut, Lock, Mail, Building2, Calendar, Clock, CalendarDays, Download, ArchiveX, Archive, FileText, Settings, Save, Euro, Map, Image as ImageIcon, Users, Search, PhoneCall, Eye, X, BellRing, BarChart3, TrendingUp, PieChart, Bot, Plus } from "lucide-react"

const API_URL = "https://artisan-ai-zirt.onrender.com";

const STATUTS_TOUS = [
  { valeur: 'nouveau', label: 'Nouveau', couleur: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { valeur: 'contacte', label: 'À relancer', couleur: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { valeur: 'planifie', label: 'Planifié', couleur: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
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

  // États pour les options de facturation modulaires (Devis / Facture)
  const [modeFacturation, setModeFacturation] = useState('horaire')
  const [montantForfait, setMontantForfait] = useState('')
  const [montantMateriel, setMontantMateriel] = useState('')
  const [messageFacturation, setMessageFacturation] = useState('')

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

  // Téléchargement direct et robuste du PDF via Blob
  const telechargerDocumentPdf = async (prospectId, typeDoc) => {
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
      if (!response.ok) throw new Error("Erreur génération PDF");

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

  // Synchronisation des états de facturation à l'ouverture d'un prospect
  useEffect(() => {
    if (prospectSelectionne) {
      setModeFacturation(prospectSelectionne.mode_facturation || 'horaire');
      setMontantForfait(prospectSelectionne.montant_forfait || '');
      setMontantMateriel(prospectSelectionne.montant_materiel || '');
      setMessageFacturation('');
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
  
  const joursEvolution = [...Array(7)].map((_, i) => {
    const d = new Date(debutAujourdhui); d.setDate(d.getDate() - (6 - i));
    return { dateObj: d, dateFr: d.toLocaleDateString('fr-FR', { weekday: 'short' }), strYMD: d.toISOString().split('T')[0], count: 0 };
  });

  const prixMoyenDemande = (profil.tarif_deplacement || 50) + (profil.tarif_horaire || 60);
  let caEncaisse = 0; let caPrevisionnel = 0; let caEnAttente = 0;

  prospects.forEach(p => {
    if (!p.date_creation || p.statut === 'annule') return; 
    const dateP = new Date(p.date_creation.replace(' ', 'T'));
    const timeP = dateP.getTime();
    const strYMD = p.date_creation.split(' ')[0];

    if (timeP >= debutAujourdhui) statsAujourdhui++;
    if (timeP >= debutSemaine) statsSemaine++;
    if (timeP >= debutMois) statsMois++;

    const jourGraph = joursEvolution.find(j => j.strYMD === strYMD);
    if (jourGraph) jourGraph.count++;

    if (dateP.getFullYear() === anneeActuelle) {
      if (p.statut === 'archive') caEncaisse += prixMoyenDemande;
      else if (p.statut === 'planifie') caPrevisionnel += prixMoyenDemande;
      else caEnAttente += prixMoyenDemande;
    }
  });

  const maxEvolution = Math.max(...joursEvolution.map(j => j.count), 1);

  const totalCA = caEncaisse + caPrevisionnel + caEnAttente;
  const safeTotalCA = totalCA || 1;
  const pctEncaisse = totalCA === 0 ? 0 : Math.round((caEncaisse / safeTotalCA) * 100);
  const pctPrevisionnel = totalCA === 0 ? 0 : Math.round((caPrevisionnel / safeTotalCA) * 100);
  
  const conicGradient = totalCA === 0 
    ? 'conic-gradient(#1e293b 0% 100%)' 
    : `conic-gradient(
        #10b981 0% ${pctEncaisse}%, 
        #a855f7 ${pctEncaisse}% ${pctEncaisse + pctPrevisionnel}%, 
        #3b82f6 ${pctEncaisse + pctPrevisionnel}% 100%
      )`;

  const prospectsActifs = prospects.filter(p => p.statut !== 'archive' && p.statut !== 'annule');
  const aRappeler = prospectsActifs.filter(p => p.statut === 'contacte').length;
  const demandesUrgentesEnAttente = prospectsActifs.filter(p => p.urgent && p.urgent.toLowerCase().includes('oui') && p.statut !== 'termine').length
  
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

  const prospectsPlanifies = prospectsActifs.filter(p => p.statut === 'planifie');
  const aPlanifier = prospectsPlanifies.filter(p => !p.date_intervention);
  const planifiesAvecDate = prospectsPlanifies.filter(p => p.date_intervention).sort((a, b) => new Date(a.date_intervention) - new Date(b.date_intervention));

  const groupesParJour = planifiesAvecDate.reduce((acc, prospect) => {
    const dateObj = new Date(prospect.date_intervention);
    const jourString = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[jourString]) acc[jourString] = [];
    acc[jourString].push(prospect);
    return acc;
  }, {});

  const prospectsArchives = prospects.filter(p => p.statut === 'archive').sort((a, b) => b.id - a.id);

  if (!artisanConnecte) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]"></div>
        <Card className="w-full max-w-[500px] bg-slate-900 border-slate-800 shadow-2xl relative z-10 p-4 sm:p-8">
          <CardHeader className="space-y-3 text-center pb-10">
            <div className="flex justify-center mb-2"><div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/50"><Wrench className="w-10 h-10 text-white" /></div></div>
            <CardTitle className="text-4xl font-extrabold tracking-tight text-white">ArtisanPro</CardTitle>
            <CardDescription className="text-slate-400 text-base">{vueAuth === 'connexion' ? 'Connectez-vous à votre espace' : 'Créez votre espace professionnel'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={vueAuth === 'connexion' ? gererConnexion : gererInscription} className="space-y-6">
              {vueAuth === 'inscription' && ( 
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <Input placeholder="Nom de l'entreprise" className="pl-12 pr-4 bg-slate-950 border-slate-700 h-12 text-white rounded-xl text-base focus:border-blue-500" value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} required />
                </div> 
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="email" placeholder="Adresse e-mail" className="pl-12 pr-4 bg-slate-950 border-slate-700 h-12 text-white rounded-xl text-base focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <Input type="password" placeholder="Mot de passe" className="pl-12 pr-4 bg-slate-950 border-slate-700 h-12 text-white rounded-xl text-base focus:border-blue-500" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
              </div>
              {erreurAuth && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {erreurAuth}</div>}
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold mt-4 rounded-xl text-base transition-colors shadow-lg shadow-blue-900/20">
                {vueAuth === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </Button>
            </form>
            <div className="mt-10 text-center text-sm text-slate-400">
              {vueAuth === 'connexion' ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              <button onClick={() => { setVueAuth(vueAuth === 'connexion' ? 'inscription' : 'connexion'); setErreurAuth(''); }} className="ml-2 text-blue-400 hover:text-blue-300 font-semibold underline-offset-4 hover:underline transition-colors">{vueAuth === 'connexion' ? "Créer un espace" : "Se connecter"}</button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans relative overflow-hidden">
      
      {/* 🔔 TOAST DE NOTIFICATION */}
      {alerteToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-blue-600 text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 animate-in slide-in-from-bottom-8 duration-500 border border-blue-400/50 min-w-[300px]">
          <div className="bg-white/20 p-2 rounded-full shrink-0"><BellRing className="w-6 h-6 animate-pulse text-white" /></div>
          <div className="flex-1">
            <h4 className="font-extrabold text-lg flex items-center justify-between">Nouveau prospect !<button onClick={() => setAlerteToast(null)} className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-blue-700 transition-colors"><X className="w-4 h-4"/></button></h4>
            <p className="text-sm text-blue-100 mt-1 font-medium">{alerteToast.nom}</p>
            <p className="text-xs text-blue-200 mt-1 truncate max-w-[220px]">{alerteToast.probleme}</p>
          </div>
        </div>
      )}

      {/* ➕ MODALE D'AJOUT MANUEL D'UN CLIENT */}
      {modalAjoutOuvert && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-blue-500"/> Ajouter une intervention manuelle</CardTitle>
              <Button variant="ghost" onClick={() => setModalAjoutOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-5 h-5"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={soumettreClientManuel} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Nom du client</label>
                  <Input value={formManuel.nom} onChange={e => setFormManuel({...formManuel, nom: e.target.value})} placeholder="ex: Jean Dupont" className="bg-slate-950 border-slate-700 text-white h-11" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Problème / Prestation</label>
                  <Input value={formManuel.probleme} onChange={e => setFormManuel({...formManuel, probleme: e.target.value})} placeholder="ex: Fuite d'eau chauffe-eau" className="bg-slate-950 border-slate-700 text-white h-11" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Téléphone</label>
                    <Input value={formManuel.telephone} onChange={e => setFormManuel({...formManuel, telephone: e.target.value})} placeholder="06 12 34 56 78" className="bg-slate-950 border-slate-700 text-white h-11" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Statut initial</label>
                    <select value={formManuel.statut} onChange={e => setFormManuel({...formManuel, statut: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 h-11 outline-none text-sm">
                      <option value="nouveau">Nouveau</option>
                      <option value="contacte">À relancer</option>
                      <option value="planifie">Planifié</option>
                      <option value="termine">Terminé (Archiver & Compter CA)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Adresse complète</label>
                  <Input value={formManuel.adresse} onChange={e => setFormManuel({...formManuel, adresse: e.target.value})} placeholder="12 rue de Paris, 75001 Paris" className="bg-slate-950 border-slate-700 text-white h-11" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Urgence ?</label>
                    <select value={formManuel.urgent} onChange={e => setFormManuel({...formManuel, urgent: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white rounded-md px-3 h-11 outline-none text-sm">
                      <option value="non">Non</option>
                      <option value="oui">Oui (Urgent)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Date de RDV (si planifié)</label>
                    <Input type="datetime-local" value={formManuel.date_intervention} onChange={e => setFormManuel({...formManuel, date_intervention: e.target.value})} className="bg-slate-950 border-slate-700 text-white h-11 text-xs" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setModalAjoutOuvert(false)} className="bg-transparent border-slate-700 text-slate-300">Annuler</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Enregistrer l'intervention</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🗂️ FENÊTRE MODAL (FICHE CLIENT + FACTURATION MODULAIRE) */}
      {prospectSelectionne && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <Card className="w-full max-w-5xl h-[90vh] bg-slate-900 border-slate-700 shadow-2xl flex flex-col overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
              <div className="flex items-center gap-4">
                 <div className="bg-blue-600/20 p-3 rounded-xl text-blue-400"><Users className="w-6 h-6" /></div>
                 <div>
                   <CardTitle className="text-2xl font-bold text-white">{prospectSelectionne.nom || 'Client Anonyme'}</CardTitle>
                   <CardDescription className="text-slate-400 mt-1">Dossier créé le {prospectSelectionne.date_creation}</CardDescription>
                 </div>
              </div>
              <Button variant="ghost" onClick={() => setProspectSelectionne(null)} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-10 w-10 p-0"><X className="w-6 h-6" /></Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 border-r border-slate-800 p-6 space-y-6 overflow-y-auto bg-slate-900/50">
                 <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><LayoutDashboard className="w-4 h-4"/> État du dossier</h4>
                   <select value={prospectSelectionne.statut} onChange={(e) => changerStatut(prospectSelectionne.id, e.target.value)} className={`w-full text-sm font-medium rounded-lg px-4 py-3 border outline-none ${STATUTS_TOUS.find(s => s.valeur === prospectSelectionne.statut)?.couleur}`}>
                      {STATUTS_TOUS.filter(s=>s.valeur!=='archive' && s.valeur!=='termine').map(s => <option key={s.valeur} value={s.valeur} className="bg-slate-900 text-slate-200">{s.label}</option>)}
                      <option value="termine" className="bg-slate-900 text-emerald-400">Terminé (Archiver)</option>
                   </select>
                 </div>
                 <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Wrench className="w-4 h-4"/> Informations Client</h4>
                   <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm">
                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Problème déclaré</span><span className="font-medium text-white">{prospectSelectionne.probleme}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Téléphone</span><span className="font-medium text-white">{prospectSelectionne.telephone}</span></div>
                      <div className="flex flex-col gap-1"><span className="text-xs text-slate-500">Adresse complète</span><span className="font-medium text-white">{prospectSelectionne.adresse}</span></div>
                   </div>
                 </div>

                 {/* PARAMÈTRES DE FACTURATION (HORAIRE / FORFAIT / MATÉRIEL) */}
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500"/> Paramètres Devis / Facture</h4>
                   
                   <div className="space-y-1">
                     <label className="text-xs text-slate-400">Mode de facturation</label>
                     <select 
                       value={modeFacturation} 
                       onChange={(e) => setModeFacturation(e.target.value)} 
                       className="w-full bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-xs outline-none focus:border-blue-500"
                     >
                       <option value="horaire">Mode Horaire (Déplacement + Main d'œuvre)</option>
                       <option value="forfait">Mode Forfait (Prix global fixe)</option>
                     </select>
                   </div>

                   {modeFacturation === 'forfait' && (
                     <div className="space-y-1 animate-in fade-in duration-200">
                       <label className="text-xs text-slate-400">Montant global du forfait (€)</label>
                       <Input 
                         type="number" 
                         step="0.01" 
                         value={montantForfait} 
                         onChange={(e) => setMontantForfait(e.target.value)} 
                         placeholder="ex: 150" 
                         className="bg-slate-900 border-slate-700 text-white h-9 text-xs" 
                       />
                     </div>
                   )}

                   <div className="space-y-1">
                     <label className="text-xs text-slate-400">Fournitures / Matériel (€ optionnel)</label>
                     <Input 
                       type="number" 
                       step="0.01" 
                       value={montantMateriel} 
                       onChange={(e) => setMontantMateriel(e.target.value)} 
                       placeholder="ex: 45" 
                       className="bg-slate-900 border-slate-700 text-white h-9 text-xs" 
                     />
                   </div>

                   <div className="pt-2 flex flex-col gap-2">
                     <Button 
                       onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'devis')} 
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 flex items-center gap-2"
                     >
                       <Download className="w-3.5 h-3.5" /> Télécharger le Devis PDF
                     </Button>
                     <Button 
                       onClick={() => telechargerDocumentPdf(prospectSelectionne.id, 'facture')} 
                       className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-9 flex items-center gap-2 border border-slate-700"
                     >
                       <Download className="w-3.5 h-3.5" /> Télécharger la Facture PDF
                     </Button>
                     {messageSauvegarde && <span className="text-center text-[10px] text-emerald-400 font-medium">{messageSauvegarde}</span>}
                   </div>
                 </div>

              </div>
              <div className="w-full md:w-2/3 flex flex-col h-full bg-slate-950/30">
                 <div className="p-4 border-b border-slate-800 bg-slate-900/80"><h4 className="text-sm font-bold text-slate-400 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Historique de la conversation IA</h4></div>
                 <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {getHistoriqueChat(prospectSelectionne).length === 0 ? (
                      <div className="text-center text-slate-500 mt-10">Aucun historique de chat (Intervention saisie manuellement).</div>
                    ) : (
                      getHistoriqueChat(prospectSelectionne).map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-md ${msg.role === 'user' ? 'bg-slate-700 text-white rounded-br-none' : 'bg-slate-800/80 border border-slate-700 text-slate-300 rounded-bl-none'}`}>
                            <div className="text-xs opacity-50 mb-1 font-bold">{msg.role === 'user' ? 'Client' : 'Assistant IA'}</div>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🧭 MENU LATÉRAL */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex z-10 relative">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 text-blue-500">
            <Wrench className="w-8 h-8" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">ArtisanPro</h1>
          </div>
          <nav className="flex flex-col gap-2">
            <button onClick={() => setVueActuelle('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${vueActuelle === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'}`}><LayoutDashboard className="w-5 h-5" /> Tableau de bord</button>
            <button onClick={() => setVueActuelle('clients')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${vueActuelle === 'clients' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'}`}><Users className="w-5 h-5" /> Répertoire Clients</button>
            <button onClick={() => setVueActuelle('statistiques')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${vueActuelle === 'statistiques' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'}`}><BarChart3 className="w-5 h-5" /> Statistiques</button>
            <button onClick={() => setVueActuelle('chat')} className={`flex items-center gap-3 px-4 py-3 mt-4 rounded-lg transition-all ${vueActuelle === 'chat' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}><MessageSquare className="w-5 h-5" /> Chatbot Client</button>
            <button onClick={() => setVueActuelle('archives')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${vueActuelle === 'archives' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}><Archive className="w-5 h-5" /> Archives</button>
            <button onClick={() => setVueActuelle('reglages')} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${vueActuelle === 'reglages' ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}><Settings className="w-5 h-5" /> Réglages Profil</button>
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold uppercase">{artisanConnecte.nom_entreprise.charAt(0)}</div>
            <div className="overflow-hidden"><p className="text-sm font-semibold text-white truncate">{artisanConnecte.nom_entreprise}</p><p className="text-xs text-slate-500">Espace Pro</p></div>
          </div>
          <Button onClick={deconnexion} variant="outline" className="w-full bg-transparent border-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"><LogOut className="w-4 h-4 mr-2" /> Déconnexion</Button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-0">
        
        {/* ========================================== */}
        {/* 📊 LE TABLEAU DE BORD (DASHBOARD) */}
        {/* ========================================== */}
        {vueActuelle === 'dashboard' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Aperçu de l'activité</h2>
                <p className="text-slate-400">Gérez les demandes de {artisanConnecte.nom_entreprise}.</p>
              </div>
              <Button onClick={() => setModalAjoutOuvert(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-11 px-5 rounded-xl shadow-lg shadow-blue-900/20">
                <Plus className="w-5 h-5"/> Ajouter une intervention
              </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <Card className="bg-slate-900 border-slate-800 shadow-xl"><CardHeader className="flex flex-row items-center justify-between p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Demandes du mois</CardTitle><Calendar className="w-5 h-5 text-blue-500" /></CardHeader><CardContent className="p-6 pt-0"><div className="text-3xl font-bold text-white">{statsMois}</div></CardContent></Card>
              <Card className="bg-slate-900 border-slate-800 shadow-xl"><CardHeader className="flex flex-row items-center justify-between p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Urgences actives</CardTitle><AlertCircle className="w-5 h-5 text-red-500" /></CardHeader><CardContent className="p-6 pt-0"><div className="text-3xl font-bold text-red-500">{demandesUrgentesEnAttente}</div></CardContent></Card>
              <Card className="bg-slate-900 border-slate-800 shadow-xl"><CardHeader className="flex flex-row items-center justify-between p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">À relancer</CardTitle><PhoneCall className="w-5 h-5 text-amber-500" /></CardHeader><CardContent className="p-6 pt-0"><div className="text-3xl font-bold text-amber-500">{aRappeler}</div></CardContent></Card>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-semibold flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-slate-400" /> Suivi des dossiers</h3>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                <button onClick={() => setFiltreStatut('actifs')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${filtreStatut === 'actifs' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>À traiter</button>
                <button onClick={() => setFiltreStatut('nouveau')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${filtreStatut === 'nouveau' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Nouveaux</button>
                <button onClick={() => setFiltreStatut('contacte')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${filtreStatut === 'contacte' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>À relancer</button>
                <button onClick={() => setFiltreStatut('planifie')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${filtreStatut === 'planifie' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-md shadow-purple-900/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Planning</button>
              </div>
            </div>
            {chargement ? (
              <div className="text-center py-10 text-slate-500 animate-pulse">Connexion à la base de données...</div>
            ) : (
              <>
                {filtreStatut === 'planifie' && (
                  <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    {aPlanifier.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                        <h4 className="text-red-400 font-bold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Rendez-vous à fixer</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {aPlanifier.map(p => (
                            <div key={p.id} className="bg-slate-900 p-4 rounded-lg border border-red-500/20 relative">
                              <Button variant="ghost" onClick={()=>setProspectSelectionne(p)} className="absolute top-2 right-2 text-slate-500 hover:text-white p-2 h-8 w-8 rounded-full"><Eye className="w-4 h-4"/></Button>
                              <p className="font-bold text-white mb-2">{p.nom}</p>
                              <div className="flex flex-col gap-2">
                                <label className="text-xs text-slate-400">Sélectionner la date :</label>
                                <input type="datetime-local" onChange={(e) => fixerRendezVous(p.id, e.target.value)} className="bg-slate-950 border border-slate-700 rounded text-sm text-white px-3 py-2 outline-none focus:border-red-400 transition-colors" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {Object.keys(groupesParJour).length === 0 && aPlanifier.length === 0 ? (
                      <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">Aucune intervention prévue.</div>
                    ) : (
                      <div className="space-y-8 pl-2">
                        {Object.entries(groupesParJour).map(([jour, prospectsDuJour]) => (
                          <div key={jour} className="relative">
                            <div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm z-10 py-3 mb-2 flex items-center gap-3"><div className="bg-purple-500/20 p-2 rounded-lg"><CalendarDays className="w-5 h-5 text-purple-400"/></div><h4 className="text-xl font-bold text-white capitalize">{jour}</h4></div>
                            <div className="space-y-4 pl-4 sm:pl-8 border-l-2 border-slate-800 ml-4">
                              {prospectsDuJour.map(p => (
                                <div key={p.id} className="relative bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-purple-500/50 transition-colors ml-4 sm:ml-6 group">
                                  <div className="absolute -left-[27px] sm:-left-[35px] top-6 w-4 h-4 rounded-full bg-purple-500 border-4 border-slate-950 group-hover:scale-125 transition-transform"></div>
                                  <Button variant="ghost" onClick={()=>setProspectSelectionne(p)} className="absolute top-4 right-4 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 p-0"><Eye className="w-4 h-4"/></Button>
                                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                    <div>
                                      <div className="text-purple-400 font-extrabold text-2xl mb-1 flex items-center gap-2"><Clock className="w-6 h-6"/>{new Date(p.date_intervention).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                                      <h5 className="text-white font-bold text-lg">{p.nom}</h5>
                                      <div className="mt-2 space-y-1"><p className="text-slate-400 text-sm flex items-center gap-2"><Wrench className="w-4 h-4"/> {p.probleme}</p><p className="text-slate-400 text-sm flex items-center gap-2"><Phone className="w-4 h-4"/> {p.telephone}</p></div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[150px]">
                                      <select value={p.statut} onChange={(e) => changerStatut(p.id, e.target.value)} className="text-xs font-medium rounded-full px-3 py-2 border cursor-pointer outline-none bg-purple-500/10 text-purple-400 border-purple-500/30">
                                        {STATUTS_TOUS.filter(s=>s.valeur!=='archive' && s.valeur!=='termine').map(s => <option key={s.valeur} value={s.valeur} className="bg-slate-900 text-slate-200">{s.label}</option>)}
                                        <option value="termine" className="bg-slate-900 text-emerald-400">Terminé (Archiver)</option>
                                      </select>
                                      <input type="datetime-local" value={p.date_intervention} onChange={(e) => fixerRendezVous(p.id, e.target.value)} className="bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 px-2 py-1 outline-none focus:border-purple-400" />
                                      <Button onClick={() => setProspectSelectionne(p)} className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 border border-blue-500/30 h-8 text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> Devis</Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {filtreStatut !== 'planifie' && (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {prospectsFiltres.length === 0 && <div className="col-span-full text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">Aucune demande dans cette catégorie.</div>}
                    {prospectsFiltres.map((prospect) => {
                      const statutActuel = prospect.statut || 'nouveau';
                      const estPlanifie = statutActuel === 'planifie';
                      const estUrgent = prospect.urgent && prospect.urgent.toLowerCase().includes('oui');
                      const infosStatut = STATUTS_TOUS.find(s => s.valeur === statutActuel) || STATUTS_TOUS[0];
                      return (
                        <Card key={prospect.id} className={`relative overflow-hidden transition-all duration-500 bg-slate-900 border-slate-700 shadow-lg hover:border-slate-600 ${estUrgent ? 'border-l-4 border-l-red-500' : ''}`}>
                          {estUrgent && (<div className="absolute top-4 right-14 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> URGENT</div>)}
                          <Button variant="ghost" onClick={()=>setProspectSelectionne(prospect)} className="absolute top-3 right-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8 p-0"><Eye className="w-4 h-4"/></Button>
                          <CardHeader className="p-6 pb-2"><CardTitle className="text-xl font-bold pr-8 text-white">{prospect.nom || "Client Anonyme"}</CardTitle></CardHeader>
                          <CardContent className="p-6 pt-0">
                            <div className="space-y-4 text-sm text-slate-300 mt-2">
                              <div className="flex items-start gap-3"><Wrench className="w-4 h-4 text-slate-500 mt-1 shrink-0" /><p className="truncate"><span className="text-slate-500">Problème:</span> {prospect.probleme}</p></div>
                              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-500 shrink-0" /><p><span className="text-slate-500">Contact:</span> {prospect.telephone}</p></div>
                              <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-slate-500 shrink-0" /><p className="truncate"><span className="text-slate-500">Adresse:</span> {prospect.adresse}</p></div>
                            </div>
                            <div className="mt-8 pt-4 border-t border-slate-800/50 text-xs text-slate-500 flex justify-between items-center gap-3">
                              <span className="shrink-0">Reçu le : {prospect.date_creation}</span>
                              <select value={statutActuel} onChange={(e) => changerStatut(prospect.id, e.target.value)} className={`text-xs font-medium rounded-full px-3 py-1.5 border cursor-pointer outline-none ${infosStatut.couleur}`}>
                                {STATUTS_TOUS.filter(s=>s.valeur!=='archive' && s.valeur!=='termine').map(s => <option key={s.valeur} value={s.valeur} className="bg-slate-900 text-slate-200">{s.label}</option>)}
                                <option value="termine" className="bg-slate-900 text-emerald-400">Terminé (Archiver)</option>
                              </select>
                            </div>
                            {estPlanifie && (
                              <div className="mt-4 pt-4 border-t border-slate-800/50 flex gap-3">
                                <Button onClick={() => setProspectSelectionne(prospect)} className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-2"><FileText className="w-4 h-4" /> Configurer & Générer le Devis</Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* 📊 LA VUE : STATISTIQUES */}
        {/* ========================================== */}
        {vueActuelle === 'statistiques' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><BarChart3 className="w-8 h-8 text-blue-500"/> Statistiques & Analyses</h2>
              <p className="text-slate-400">Suivez vos performances, l'évolution de vos demandes et votre chiffre d'affaires.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Aujourd'hui</CardTitle></CardHeader>
                <CardContent className="p-6 pt-0"><div className="text-4xl font-extrabold text-white">{statsAujourdhui}</div><p className="text-xs text-blue-400 mt-2 font-medium">Nouvelles demandes</p></CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Cette semaine</CardTitle></CardHeader>
                <CardContent className="p-6 pt-0"><div className="text-4xl font-extrabold text-white">{statsSemaine}</div><p className="text-xs text-purple-400 mt-2 font-medium">Les 7 derniers jours</p></CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                <CardHeader className="p-6 pb-2"><CardTitle className="text-sm font-medium text-slate-400">Ce mois-ci</CardTitle></CardHeader>
                <CardContent className="p-6 pt-0"><div className="text-4xl font-extrabold text-white">{statsMois}</div><p className="text-xs text-emerald-400 mt-2 font-medium">Depuis le 1er du mois</p></CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="px-6 pt-6 pb-2 border-b border-slate-800/50"><CardTitle className="text-lg text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500"/> Évolution (7 derniers jours)</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 mt-4">
                    {joursEvolution.map((jour, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 group">
                        <div className="w-full flex justify-center mb-2">
                           <span className="text-xs font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded-md">{jour.count}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-t-sm h-full relative overflow-hidden transition-all hover:bg-slate-700">
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000 ease-out rounded-t-sm" style={{ height: `${(jour.count / maxEvolution) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-slate-500 mt-3 uppercase font-medium">{jour.dateFr}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800 shadow-xl">
                <CardHeader className="px-6 pt-6 pb-2 border-b border-slate-800/50">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-500"/> Chiffre d'Affaires Global ({anneeActuelle})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-8 justify-center h-72">
                  <div className="w-40 h-40 rounded-full flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative" style={{ background: conicGradient }}>
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center absolute shadow-inner">
                       <div className="text-center">
                         <div className="text-xl font-extrabold text-white">{totalCA}€</div>
                         <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total</div>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4 w-full max-w-[200px]">
                    <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                         <span className="flex items-center gap-2 font-medium"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Encaissé</span>
                         <span className="font-bold text-emerald-400">{caEncaisse}€</span>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                         <span className="flex items-center gap-2 font-medium"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Prévisionnel</span>
                         <span className="font-bold text-purple-400">{caPrevisionnel}€</span>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs text-slate-400 mb-1">
                         <span className="flex items-center gap-2 font-medium"><div className="w-3 h-3 rounded-full bg-blue-500"></div> En attente</span>
                         <span className="font-bold text-blue-400">{caEnAttente}€</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 👥 VUE : RÉPERTOIRE CLIENTS */}
        {/* ========================================== */}
        {vueActuelle === 'clients' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><Users className="w-8 h-8 text-blue-500"/> Répertoire Clients</h2>
                <p className="text-slate-400">Consultez et recherchez l'ensemble de vos contacts et prospects.</p>
              </div>
              <Button onClick={() => setModalAjoutOuvert(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-11 px-5 rounded-xl shadow-lg shadow-blue-900/20">
                <Plus className="w-5 h-5"/> Ajouter une intervention
              </Button>
            </header>
            <div className="mb-6 relative"><Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><Input value={rechercheClient} onChange={(e) => setRechercheClient(e.target.value)} placeholder="Rechercher par nom, numéro, adresse, problème..." className="h-12 pl-12 pr-4 bg-slate-900 border-slate-800 text-white rounded-xl text-base w-full max-w-md shadow-lg" /></div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950/50 text-slate-300 uppercase font-semibold border-b border-slate-800 text-xs">
                    <tr><th className="px-6 py-4">Client</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4 hidden md:table-cell">Problème</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4 text-right">Dossier</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {clientsFiltresRecherche.map(p => {
                      const infosStatut = STATUTS_TOUS.find(s => s.valeur === p.statut) || STATUTS_TOUS[0];
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{p.nom || "Inconnu"}</td><td className="px-6 py-4">{p.telephone || "-"}</td><td className="px-6 py-4 hidden md:table-cell truncate max-w-[250px]" title={p.probleme}>{p.probleme || "-"}</td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium border ${infosStatut.couleur}`}>{infosStatut.label}</span></td>
                          <td className="px-6 py-4 text-right"><Button onClick={() => setProspectSelectionne(p)} variant="outline" className="h-8 bg-transparent border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"><Eye className="w-3 h-3 mr-2"/> Ouvrir</Button></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {clientsFiltresRecherche.length === 0 && (<div className="text-center py-12 text-slate-500">Aucun client ne correspond à votre recherche.</div>)}
            </div>
          </div>
        )}

        {/* VUE ARCHIVES */}
        {vueActuelle === 'archives' && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10"><h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><Archive className="w-8 h-8 text-slate-500"/> Archives Comptables</h2><p className="text-slate-400">Historique de toutes vos interventions terminées et archivées.</p></header>
            {chargement ? (
              <div className="text-center py-10 text-slate-500 animate-pulse">Chargement des archives...</div>
            ) : prospectsArchives.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">Vos archives sont vides.</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {prospectsArchives.map((prospect) => (
                  <Card key={prospect.id} className="relative overflow-hidden transition-all duration-500 bg-slate-900/30 border-slate-800/40 opacity-70 grayscale-[30%]">
                    <CardHeader className="p-6 pb-2"><CardTitle className="text-xl font-bold text-slate-400">{prospect.nom}</CardTitle></CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="space-y-4 text-sm text-slate-400 mt-2">
                        <div className="flex items-start gap-3"><Wrench className="w-4 h-4 text-slate-600 mt-1" /><p><span className="text-slate-600">Problème:</span> {prospect.probleme}</p></div>
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-600" /><p><span className="text-slate-600">Contact:</span> {prospect.telephone}</p></div>
                      </div>
                      <div className="mt-8 pt-4 border-t border-slate-800/30 flex gap-3">
                        <Button onClick={() => telechargerDocumentPdf(prospect.id, 'facture')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-2"><Download className="w-4 h-4" /> Ré-imprimer la Facture</Button>
                        <Button onClick={() => setProspectSelectionne(prospect)} variant="outline" className="bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800"><Eye className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* ⚙️ VUE : RÉGLAGES */}
        {/* ========================================== */}
        {vueActuelle === 'reglages' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <header className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><Settings className="w-8 h-8 text-blue-500"/> Personnalisation</h2>
              <p className="text-slate-400">Réglez vos informations et adaptez le comportement de votre Assistant IA.</p>
            </header>
            <form onSubmit={sauvegarderProfil}>
              <div className="space-y-6">
                
                {/* 🏖️ BLOC 0 : MODE VACANCES / ABSENCE */}
                <Card className="bg-slate-900 border-amber-500/30 shadow-lg border-l-4 border-l-amber-500">
                  <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-800/50">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-500"/> Mode Vacances / Absence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white">Activer le mode vacances</h4>
                        <p className="text-xs text-slate-400">L'IA préviendra automatiquement vos clients par WhatsApp de votre absence.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={profil.en_vacances === 1} 
                          onChange={(e) => setProfil({...profil, en_vacances: e.target.checked ? 1 : 0})} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Date de retour prévue (optionnel)</label>
                      <Input 
                        value={profil.date_retour_vacances || ''} 
                        onChange={(e) => setProfil({...profil, date_retour_vacances: e.target.value})} 
                        placeholder="ex: 18 août" 
                        className="h-12 px-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* BLOC 1 : IDENTITÉ & MÉTIER */}
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                  <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-800/50"><CardTitle className="text-lg text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-500"/> Identité & Contact</CardTitle></CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Nom de l'entreprise</label><Input value={profil.nom_entreprise || ''} onChange={(e) => setProfil({...profil, nom_entreprise: e.target.value})} className="h-12 px-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" required /></div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Votre Métier</label>
                      <div className="relative">
                        <Wrench className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                        <select
                          value={profil.metier || 'Artisan'}
                          onChange={(e) => setProfil({...profil, metier: e.target.value})}
                          className="h-12 pl-12 pr-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base w-full outline-none focus:border-blue-500"
                          required
                        >
                          <option value="Artisan">Général / Autre</option>
                          <option value="Plombier">Plombier</option>
                          <option value="Électricien">Électricien</option>
                          <option value="Serrurier">Serrurier</option>
                          <option value="Chauffagiste">Chauffagiste / Climatisation</option>
                          <option value="Jardinier / Paysagiste">Jardinier / Paysagiste</option>
                          <option value="Couvreur / Zingueur">Couvreur / Zingueur</option>
                          <option value="Peintre">Peintre</option>
                          <option value="Menuisier">Menuisier</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Téléphone pro.</label><div className="relative"><Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><Input value={profil.telephone || ''} onChange={(e) => setProfil({...profil, telephone: e.target.value})} placeholder="06 00 00 00 00" className="h-12 pl-12 pr-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" /></div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Adresse de l'entreprise</label><div className="relative"><MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><Input value={profil.adresse || ''} onChange={(e) => setProfil({...profil, adresse: e.target.value})} placeholder="10 rue de la Paix, Paris" className="h-12 pl-12 pr-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" /></div></div>
                  </CardContent>
                </Card>

                {/* BLOC 2 : COMPORTEMENT DE L'IA */}
                <Card className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-blue-600">
                  <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-800/50"><CardTitle className="text-lg text-white flex items-center gap-2"><Bot className="w-5 h-5 text-blue-500"/> Comportement de l'Assistant IA</CardTitle></CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Tutoiement ou Vouvoiement</label>
                      <select
                        value={profil.ai_ton || 'vouvoiement'}
                        onChange={(e) => setProfil({...profil, ai_ton: e.target.value})}
                        className="h-12 px-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base w-full outline-none focus:border-blue-500"
                      >
                        <option value="vouvoiement">Vouvoiement (Bonjour, comment puis-je vous aider ?)</option>
                        <option value="tutoiement">Tutoiement (Salut, comment puis-je t'aider ?)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Style de communication</label>
                      <select
                        value={profil.ai_style || 'professionnel'}
                        onChange={(e) => setProfil({...profil, ai_style: e.target.value})}
                        className="h-12 px-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base w-full outline-none focus:border-blue-500"
                      >
                        <option value="professionnel">Professionnel, poli et direct</option>
                        <option value="chaleureux">Chaleureux, empathique et souriant</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-400">Consignes et ordre des questions (Instructions pour l'IA)</label>
                      <textarea
                        rows={3}
                        value={profil.ai_consignes || ''}
                        onChange={(e) => setProfil({...profil, ai_consignes: e.target.value})}
                        placeholder="Ex: Demander d'abord le problème, puis le téléphone avant l'adresse..."
                        className="p-4 bg-slate-950 border border-slate-700 text-white rounded-lg text-base w-full outline-none focus:border-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* BLOC 3 : LOGISTIQUE */}
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                  <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-800/50"><CardTitle className="text-lg text-white flex items-center gap-2"><Map className="w-5 h-5 text-emerald-500"/> Logistique</CardTitle></CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Horaires d'ouverture</label><div className="relative"><Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><Input value={profil.horaires || ''} onChange={(e) => setProfil({...profil, horaires: e.target.value})} placeholder="Lun-Ven 8h-18h" className="h-12 pl-12 pr-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" /></div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Zone d'intervention</label><div className="relative"><MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" /><Input value={profil.zone_intervention || ''} onChange={(e) => setProfil({...profil, zone_intervention: e.target.value})} placeholder="Île-de-France (50km max)" className="h-12 pl-12 pr-4 bg-slate-950 border-slate-700 text-white rounded-lg text-base" /></div></div>
                  </CardContent>
                </Card>

                {/* BLOC 4 : TARIFS */}
                <Card className="bg-slate-900 border-slate-800 shadow-lg">
                  <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-800/50"><CardTitle className="text-lg text-white flex items-center gap-2"><Euro className="w-5 h-5 text-amber-500"/> Tarification</CardTitle></CardHeader>
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Frais de déplacement (€)</label><Input type="number" step="0.01" value={profil.tarif_deplacement || ''} onChange={(e) => setProfil({...profil, tarif_deplacement: parseFloat(e.target.value) || 0})} className="h-12 px-4 bg-slate-950 border-slate-700 text-white font-bold text-amber-400 rounded-lg text-base" required /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-slate-400">Taux Horaire Main d'oeuvre (€)</label><Input type="number" step="0.01" value={profil.tarif_horaire || ''} onChange={(e) => setProfil({...profil, tarif_horaire: parseFloat(e.target.value) || 0})} className="h-12 px-4 bg-slate-950 border-slate-700 text-white font-bold text-amber-400 rounded-lg text-base" required /></div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800"><Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-lg text-base font-medium shadow-lg shadow-blue-900/20"><Save className="w-5 h-5 mr-2" /> Sauvegarder les paramètres</Button>{messageSauvegarde && (<span className={`text-base font-medium ${messageSauvegarde.includes('Erreur') ? 'text-red-400' : 'text-emerald-400'} animate-in fade-in`}>{messageSauvegarde}</span>)}</div>
            </form>
          </div>
        )}

        {/* VUE CHATBOT */}
        {vueActuelle === 'chat' && (
          <div className="max-w-3xl mx-auto h-[80vh] flex flex-col animate-in fade-in duration-500">
            <header className="mb-6"><h2 className="text-3xl font-bold text-white">Chatbot Client</h2><p className="text-slate-400">Simulez le point de vue d'un client de {artisanConnecte.nom_entreprise}.</p></header>
            <Card className="flex-1 bg-slate-900 border-slate-800 flex flex-col overflow-hidden shadow-xl">
              <CardContent className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'}`}>{msg.content}</div></div>
                ))}
                {iaReflechit && (<div className="flex justify-start"><div className="max-w-[80%] rounded-2xl p-4 text-sm shadow-md bg-slate-800 text-slate-400 border border-slate-700 rounded-bl-none flex gap-1"><span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span></div></div>)}
              </CardContent>
              <div className="p-4 border-t border-slate-800 bg-slate-950">
                <form onSubmit={envoyerMessage} className="flex gap-3"><Input value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)} placeholder="Décrivez votre besoin en détail..." className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-12" disabled={iaReflechit} /><Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6" disabled={iaReflechit}><Send className="w-4 h-4 mr-2" /> Envoyer</Button></form>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
