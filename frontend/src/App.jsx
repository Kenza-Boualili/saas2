import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutDashboard, MessageSquare, AlertCircle, Wrench, Phone, MapPin, Send, Filter, LogOut, Lock, Mail, Building2, Calendar, Clock, Download, Archive, FileText, Settings, Save, Euro, Map, Users, Search, Eye, X, BellRing, BarChart3, TrendingUp, PieChart, Bot, Plus, Wallet, FileSpreadsheet, Receipt, Truck, ShoppingCart, Package, CalendarCheck, ShieldAlert, Target, Bell, Moon, Sun, User, LogOut as SignOut, Settings as SettingsIcon, ArrowUpRight, ArrowDownRight, MessageCircle, RefreshCw, CheckCircle2, MoreVertical, Edit3, Trash2, UserX, Upload, UserPlus, RefreshCcw, MoreHorizontal } from "lucide-react"

const API_URL = "https://artisan-ai-zirt.onrender.com";

const STATUTS_TOUS = [
  { valeur: 'nouveau', label: 'Lead', couleur: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { valeur: 'contacte', label: 'Contacté', couleur: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { valeur: 'planifie', label: 'Devis envoyé', couleur: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { valeur: 'termine', label: 'Gagné', couleur: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { valeur: 'annule', label: 'Perdu', couleur: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
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
  const [prospectSelectionne, setProspectSelectionne] = useState(null)

  // États spécifiques au Répertoire Clients
  const [modalNouveauClientOuvert, setModalNouveauClientOuvert] = useState(false)
  const [modalModifierClientOuvert, setModalModifierClientOuvert] = useState(false)
  const [modalAjoutContactOuvert, setModalAjoutContactOuvert] = useState(false)
  const [menuActionClientId, setMenuActionClientId] = useState(null)

  // État pour le Drawer coulissant du CRM
  const [dealSelectionneCrm, setDealSelectionneCrm] = useState(null)

  const [filtreStatutClient, setFiltreStatutClient] = useState('Tous')
  const [rechercheClientInput, setRechercheClientInput] = useState('')
  
  const [formNouveauClient, setFormNouveauClient] = useState({
    nom: '', email: '', telephone: '', entreprise: '', adresse: '', code_postal: '75001', ville: 'Paris', siret: '', statut: 'Actif', notes: ''
  })
  const [formModifClient, setFormModifClient] = useState({
    id: null, nom: '', email: '', telephone: '', entreprise: '', adresse: '', code_postal: '', ville: '', siret: '', statut: 'Actif', notes: ''
  })
  const [formNouveauContact, setFormNouveauContact] = useState({
    prenom: '', nom: '', email: '', telephone: '', role: 'Autre', fonction: '', notes: ''
  })
  const [contactsClient, setContactsClient] = useState([])
  const [ongletClientDetail, setOngletClientDetail] = useState('devis')

  // États CRM spécifiques
  const [rechercheCrm, setRechercheCrm] = useState('')
  const [filtreStageCrm, setFiltreStageCrm] = useState('Tous les stages')
  const [filtrePeriodeCrm, setFiltrePeriodeCrm] = useState('Tout')

  const [isDarkMode, setIsDarkMode] = useState(true)
  const [rechercheGlobale, setRechercheGlobale] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const gererRaccourciClavier = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', gererRaccourciClavier);
    return () => window.removeEventListener('keydown', gererRaccourciClavier);
  }, []);

  const [menuNotifOuvert, setMenuNotifOuvert] = useState(false)
  const [menuProfilOuvert, setMenuProfilOuvert] = useState(false)

  const anneeActuelleReelle = new Date().getFullYear();
  const anneesDisponibles = [];
  for (let y = 2026; y <= anneeActuelleReelle; y++) {
    anneesDisponibles.push(y);
  }
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(anneeActuelleReelle);

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
        body: JSON.stringify({ 
          artisan_id: artisanConnecte.id, 
          nom: formNouveauClient.nom,
          probleme: formNouveauClient.notes || (formNouveauClient.entreprise ? `Entreprise: ${formNouveauClient.entreprise}` : 'Intervention générale'),
          telephone: formNouveauClient.telephone || '0600000000',
          adresse: `${formNouveauClient.adresse || ''}, ${formNouveauClient.code_postal} ${formNouveauClient.ville}`,
          statut: 'nouveau'
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalNouveauClientOuvert(false);
        setFormNouveauClient({ nom: '', email: '', telephone: '', entreprise: '', adresse: '', code_postal: '75001', ville: 'Paris', siret: '', statut: 'Actif', notes: '' });
        chargerProspects(true);
      }
    } catch (err) {
      alert("Erreur lors de l'enregistrement du client.");
    }
  }

  const sauvegarderModificationClient = async (e) => {
    e.preventDefault();
    if (!formModifClient.id) return;
    setProspects(prospects.map(p => p.id === formModifClient.id ? {
      ...p,
      nom: formModifClient.nom,
      telephone: formModifClient.telephone,
      adresse: `${formModifClient.adresse}, ${formModifClient.code_postal} ${formModifClient.ville}`,
      entreprise: formModifClient.entreprise
    } : p));
    if (prospectSelectionne && prospectSelectionne.id === formModifClient.id) {
      setProspectSelectionne({
        ...prospectSelectionne,
        nom: formModifClient.nom,
        telephone: formModifClient.telephone,
        adresse: `${formModifClient.adresse}, ${formModifClient.code_postal} ${formModifClient.ville}`,
        entreprise: formModifClient.entreprise
      });
    }
    setModalModifierClientOuvert(false);
    alert("Client modifié avec succès !");
  }

  const supprimerClient = async (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
      setProspects(prospects.filter(p => p.id !== id));
      if (prospectSelectionne && prospectSelectionne.id === id) setProspectSelectionne(null);
      setMenuActionClientId(null);
    }
  }

  const basculerStatutClient = (id) => {
    setProspects(prospects.map(p => {
      if (p.id === id) {
        const nouveauStatut = p.statut === 'archive' ? 'nouveau' : 'archive';
        return { ...p, statut: nouveauStatut };
      }
      return p;
    }));
    setMenuActionClientId(null);
  }

  const ajouterContactClient = (e) => {
    e.preventDefault();
    if (!formNouveauContact.prenom || !formNouveauContact.nom) return;
    setContactsClient([...contactsClient, { ...formNouveauContact, id: Date.now() }]);
    setFormNouveauContact({ prenom: '', nom: '', email: '', telephone: '', role: 'Autre', fonction: '', notes: '' });
    setModalAjoutContactOuvert(false);
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

  const resultatsRechercheGlobale = rechercheGlobale.trim() === '' ? [] : (prospects || []).filter(p => {
    if (p.statut === 'annule' || p.statut === 'archive') return false;
    const terme = rechercheGlobale.toLowerCase();
    return (p.nom && p.nom.toLowerCase().includes(terme)) || 
           (p.telephone && p.telephone.toLowerCase().includes(terme)) || 
           (p.probleme && p.probleme.toLowerCase().includes(terme)) ||
           (p.adresse && p.adresse.toLowerCase().includes(terme));
  });

  if (!artisanConnecte) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0f1d] text-slate-50' : 'bg-slate-50 text-slate-900'} flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors`}>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <Card className={`w-full max-w-[480px] ${isDarkMode ? 'bg-[#111827] border-slate-800 text-slate-50' : 'bg-white border-slate-200 text-slate-900 shadow-xl'} shadow-2xl relative z-10 p-6 sm:p-8 rounded-2xl`}>
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="flex justify-center mb-2"><div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-900/50"><Wrench className="w-8 h-8 text-slate-950 font-bold" /></div></div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">KraftPilot</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>{vueAuth === 'connexion' ? 'Connectez-vous à votre espace' : 'Créez votre espace professionnel'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={vueAuth === 'connexion' ? gererConnexion : gererInscription} className="space-y-5">
              {vueAuth === 'inscription' && ( 
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <Input placeholder="Nom de l'entreprise" className={`pl-12 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} h-12 rounded-xl text-sm focus:border-emerald-500`} value={nomEntreprise} onChange={(e) => setNomEntreprise(e.target.value)} required />
                </div> 
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <Input type="email" placeholder="Adresse e-mail" className={`pl-12 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} h-12 rounded-xl text-sm focus:border-emerald-500`} value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <Input type="password" placeholder="Mot de passe" className={`pl-12 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} h-12 rounded-xl text-sm focus:border-emerald-500`} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
              </div>
              {erreurAuth && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {erreurAuth}</div>}
              <Button type="submit" className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold mt-2 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-900/20">
                {vueAuth === 'connexion' ? 'Se connecter' : "S'inscrire"}
              </Button>
            </form>
            <div className={`mt-8 text-center text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {vueAuth === 'connexion' ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
              <button onClick={() => { setVueAuth(vueAuth === 'connexion' ? 'inscription' : 'connexion'); setErreurAuth(''); }} className="ml-2 text-emerald-500 hover:text-emerald-400 font-semibold underline-offset-4 hover:underline">{vueAuth === 'connexion' ? "Créer un espace" : "Se connecter"}</button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0f1d] text-slate-50' : 'bg-slate-100 text-slate-900'} flex font-sans relative overflow-hidden transition-colors`}>
      
      {modalAjoutOuvert && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className={`w-full max-w-lg ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl rounded-2xl`}>
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Plus className="w-5 h-5 text-emerald-500"/> Nouvelle Intervention</CardTitle>
              <Button variant="ghost" onClick={() => setModalAjoutOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={soumettreClientManuel} className="space-y-4">
                <div><label className="text-xs text-slate-400 font-medium">Nom du client</label><Input value={formManuel.nom} onChange={e => setFormManuel({...formManuel, nom: e.target.value})} placeholder="ex: Jean Dupont" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                <div><label className="text-xs text-slate-400 font-medium">Prestation / Problème</label><Input value={formManuel.probleme} onChange={e => setFormManuel({...formManuel, probleme: e.target.value})} placeholder="ex: Fuite d'eau" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 font-medium">Téléphone</label><Input value={formManuel.telephone} onChange={e => setFormManuel({...formManuel, telephone: e.target.value})} placeholder="06 12 34 56 78" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                  <div><label className="text-xs text-slate-400 font-medium">Statut</label><select value={formManuel.statut} onChange={e => setFormManuel({...formManuel, statut: e.target.value})} className={`w-full ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-md px-3 h-10 text-xs mt-1 outline-none`}><option value="nouveau">Nouveau</option><option value="contacte">À relancer</option><option value="planifie">Planifié</option><option value="termine">Terminé</option></select></div>
                </div>
                <div><label className="text-xs text-slate-400 font-medium">Adresse complète</label><Input value={formManuel.adresse} onChange={e => setFormManuel({...formManuel, adresse: e.target.value})} placeholder="12 rue de Paris, 75001 Paris" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                <div className="pt-3 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setModalAjoutOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button><Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-10 text-xs">Enregistrer</Button></div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODALE CRÉATION NOUVEAU CLIENT */}
      {modalNouveauClientOuvert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className={`w-full max-w-2xl ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl rounded-2xl`}>
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <div>
                <CardTitle className="text-lg font-bold">Nouveau client</CardTitle>
                <CardDescription className="text-xs text-slate-400">Créez un nouveau client pour votre entreprise</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setModalNouveauClientOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={soumettreClientManuel} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Nom *</label>
                    <Input value={formNouveauClient.nom} onChange={e => setFormNouveauClient({...formNouveauClient, nom: e.target.value})} placeholder="Nom du client" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} required />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Email</label>
                    <Input type="email" value={formNouveauClient.email} onChange={e => setFormNouveauClient({...formNouveauClient, email: e.target.value})} placeholder="client@exemple.com" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Téléphone</label>
                    <Input value={formNouveauClient.telephone} onChange={e => setFormNouveauClient({...formNouveauClient, telephone: e.target.value})} placeholder="06 12 34 56 78" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Entreprise</label>
                    <Input value={formNouveauClient.entreprise} onChange={e => setFormNouveauClient({...formNouveauClient, entreprise: e.target.value})} placeholder="Nom de l'entreprise" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-400 font-medium">Adresse</label>
                    <Input value={formNouveauClient.adresse} onChange={e => setFormNouveauClient({...formNouveauClient, adresse: e.target.value})} placeholder="123 rue de la République" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Code postal</label>
                    <Input value={formNouveauClient.code_postal} onChange={e => setFormNouveauClient({...formNouveauClient, code_postal: e.target.value})} placeholder="75001" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Ville</label>
                    <Input value={formNouveauClient.ville} onChange={e => setFormNouveauClient({...formNouveauClient, ville: e.target.value})} placeholder="Paris" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">SIRET</label>
                    <Input value={formNouveauClient.siret} onChange={e => setFormNouveauClient({...formNouveauClient, siret: e.target.value})} placeholder="12345678901234" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Statut</label>
                    <select value={formNouveauClient.statut} onChange={e => setFormNouveauClient({...formNouveauClient, statut: e.target.value})} className={`w-full ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-md px-3 h-10 mt-1 outline-none`}>
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setModalNouveauClientOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 px-5 text-xs shadow-lg shadow-amber-900/20">Créer le client</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODALE MODIFIER CLIENT */}
      {modalModifierClientOuvert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className={`w-full max-w-2xl ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl rounded-2xl`}>
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <div>
                <CardTitle className="text-lg font-bold">Modifier le client</CardTitle>
                <CardDescription className="text-xs text-slate-400">Modifiez les informations du client</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setModalModifierClientOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={sauvegarderModificationClient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Nom complet</label>
                    <Input value={formModifClient.nom} onChange={e => setFormModifClient({...formModifClient, nom: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} required />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Entreprise</label>
                    <Input value={formModifClient.entreprise} onChange={e => setFormModifClient({...formModifClient, entreprise: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Email</label>
                    <Input value={formModifClient.email} onChange={e => setFormModifClient({...formModifClient, email: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Téléphone</label>
                    <Input value={formModifClient.telephone} onChange={e => setFormModifClient({...formModifClient, telephone: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-400 font-medium">Adresse</label>
                    <Input value={formModifClient.adresse} onChange={e => setFormModifClient({...formModifClient, adresse: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Code postal</label>
                    <Input value={formModifClient.code_postal} onChange={e => setFormModifClient({...formModifClient, code_postal: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Ville</label>
                    <Input value={formModifClient.ville} onChange={e => setFormModifClient({...formModifClient, ville: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setModalModifierClientOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 px-5 text-xs shadow-lg shadow-amber-900/20">Modifier</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODALE AJOUTER UN CONTACT */}
      {modalAjoutContactOuvert && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className={`w-full max-w-lg ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl rounded-2xl`}>
            <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800/60">
              <div>
                <CardTitle className="text-lg font-bold">Ajouter un contact</CardTitle>
                <CardDescription className="text-xs text-slate-400">Ajoutez un nouveau contact pour ce client.</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setModalAjoutContactOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={ajouterContactClient} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-medium">Prénom *</label>
                    <Input value={formNouveauContact.prenom} onChange={e => setFormNouveauContact({...formNouveauContact, prenom: e.target.value})} placeholder="Prénom" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} required />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Nom *</label>
                    <Input value={formNouveauContact.nom} onChange={e => setFormNouveauContact({...formNouveauContact, nom: e.target.value})} placeholder="Nom" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} required />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Email</label>
                  <Input value={formNouveauContact.email} onChange={e => setFormNouveauContact({...formNouveauContact, email: e.target.value})} placeholder="email@exemple.com" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Téléphone</label>
                  <Input value={formNouveauContact.telephone} onChange={e => setFormNouveauContact({...formNouveauContact, telephone: e.target.value})} placeholder="06 12 34 56 78" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-medium">Rôle</label>
                    <select value={formNouveauContact.role} onChange={e => setFormNouveauContact({...formNouveauContact, role: e.target.value})} className={`w-full ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-md px-3 h-10 mt-1 outline-none`}>
                      <option value="Autre">Autre</option>
                      <option value="Décideur">Décideur</option>
                      <option value="Technique">Technique</option>
                      <option value="Comptabilité">Comptabilité</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Fonction</label>
                    <Input value={formNouveauContact.fonction} onChange={e => setFormNouveauContact({...formNouveauContact, fonction: e.target.value})} placeholder="Ex: Chef de chantier" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Notes</label>
                  <textarea value={formNouveauContact.notes} onChange={e => setFormNouveauContact({...formNouveauContact, notes: e.target.value})} placeholder="Notes additionnelles..." className={`w-full ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-md p-3 h-20 mt-1 outline-none resize-none`}></textarea>
                </div>
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setModalAjoutContactOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold h-10 px-5 text-xs shadow-lg shadow-amber-900/20">Ajouter</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VUE DÉTAILS CLIENT (QUAND ON CLIQUE SUR UN CLIENT) */}
      {prospectSelectionne && vueActuelle === 'clients' && (
        <div className="fixed inset-0 bg-[#0a0f1d] z-50 flex flex-col overflow-y-auto p-6 lg:p-10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setProspectSelectionne(null)} className="bg-slate-800/50 border-slate-700 text-slate-200 h-9 text-xs">← Retour</Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-white">{prospectSelectionne.nom}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${prospectSelectionne.statut === 'archive' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                    {prospectSelectionne.statut === 'archive' ? 'Inactif' : 'Actif'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{prospectSelectionne.entreprise || 'Client Particulier'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => {
                setFormModifClient({
                  id: prospectSelectionne.id,
                  nom: prospectSelectionne.nom,
                  email: prospectSelectionne.email || 'kenza.boualili2006@gmail.com',
                  telephone: prospectSelectionne.telephone,
                  entreprise: prospectSelectionne.entreprise || '',
                  adresse: prospectSelectionne.adresse || '',
                  code_postal: '78300',
                  ville: 'Poissy',
                  siret: ''
                });
                setModalModifierClientOuvert(true);
              }} variant="outline" className="h-9 bg-[#111827] border-slate-700 text-slate-200 text-xs"><Edit3 className="w-3.5 h-3.5 mr-1.5"/> Modifier</Button>
              
              <Button onClick={() => { setVueActuelle('crm'); }} variant="outline" className="h-9 bg-[#111827] border-slate-700 text-slate-200 text-xs"><Target className="w-3.5 h-3.5 mr-1.5 text-amber-400"/> Ajouter au CRM</Button>
              <Button onClick={() => setModalAjoutOuvert(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl"><FileText className="w-4 h-4 mr-1.5"/> Nouveau devis</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-[#111827] border-slate-800 p-5 rounded-2xl shadow-xl">
              <p className="text-xs text-slate-400">CA Total</p>
              <h3 className="text-2xl font-black text-white mt-1">0,00 €</h3>
              <p className="text-[10px] text-emerald-400 mt-1">Factures payées</p>
            </Card>
            <Card className="bg-[#111827] border-slate-800 p-5 rounded-2xl shadow-xl">
              <p className="text-xs text-slate-400">Devis</p>
              <h3 className="text-2xl font-black text-white mt-1">0</h3>
              <p className="text-[10px] text-slate-400 mt-1">Total envoyés</p>
            </Card>
            <Card className="bg-[#111827] border-slate-800 p-5 rounded-2xl shadow-xl">
              <p className="text-xs text-slate-400">Factures</p>
              <h3 className="text-2xl font-black text-white mt-1">0</h3>
              <p className="text-[10px] text-slate-400 mt-1">0,00 € impayées</p>
            </Card>
            <Card className="bg-[#111827] border-slate-800 p-5 rounded-2xl shadow-xl">
              <p className="text-xs text-slate-400">Dernière intervention</p>
              <h3 className="text-2xl font-black text-white mt-1">-</h3>
              <p className="text-[10px] text-slate-400 mt-1">Date</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Informations</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-300"><Mail className="w-4 h-4 text-amber-400 shrink-0"/> <span>{prospectSelectionne.email || 'kenza.boualili2006@gmail.com'}</span></div>
                  <div className="flex items-center gap-3 text-slate-300"><Phone className="w-4 h-4 text-amber-400 shrink-0"/> <span>{prospectSelectionne.telephone}</span></div>
                  <div className="flex items-center gap-3 text-slate-300"><MapPin className="w-4 h-4 text-amber-400 shrink-0"/> <span>{prospectSelectionne.adresse}</span></div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 mb-1">Notes</h4>
                  <p className="text-xs text-slate-300 bg-[#0a0f1d] p-3 rounded-xl border border-slate-800">{prospectSelectionne.probleme || 'Aucune note particulière.'}</p>
                </div>
              </Card>

              {/* SECTION CONTACTS DU CLIENT */}
              <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400"/>
                    <h3 className="text-sm font-bold text-white">Contacts</h3>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">{contactsClient.length}</span>
                  </div>
                  <Button onClick={() => setModalAjoutContactOuvert(true)} size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8 px-3">
                    <Plus className="w-3.5 h-3.5 mr-1"/> Ajouter
                  </Button>
                </div>

                {contactsClient.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Users className="w-8 h-8 mx-auto text-slate-600"/>
                    <p className="text-xs text-slate-400">Aucun contact</p>
                    <button onClick={() => setModalAjoutContactOuvert(true)} className="text-xs text-amber-400 font-semibold hover:underline">Ajouter un contact</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactsClient.map(c => (
                      <div key={c.id} className="p-3 bg-[#0a0f1d] rounded-xl border border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-white">{c.prenom} {c.nom} <span className="text-[10px] text-amber-400 font-normal">({c.role})</span></p>
                        <p className="text-slate-400">{c.telephone} • {c.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button onClick={() => setOngletClientDetail('devis')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${ongletClientDetail === 'devis' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Devis (0)</button>
                <button onClick={() => setOngletClientDetail('factures')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${ongletClientDetail === 'factures' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Factures (0)</button>
                <button onClick={() => setOngletClientDetail('planning')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${ongletClientDetail === 'planning' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>Planning</button>
              </div>

              <Card className="bg-[#111827] border-slate-800 p-8 rounded-2xl shadow-xl text-center space-y-4 min-h-[350px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"><FileText className="w-6 h-6"/></div>
                <div>
                  <h4 className="text-sm font-bold text-white">Historique des {ongletClientDetail}</h4>
                  <p className="text-xs text-slate-400 mt-1">Derniers {ongletClientDetail} pour ce client</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MENU LATÉRAL UNIQUE */}
      <aside className={`w-64 ${isDarkMode ? 'bg-[#0d1322] border-slate-800/80 text-slate-50' : 'bg-white border-slate-200 text-slate-900'} border-r flex flex-col hidden lg:flex z-10 shrink-0 transition-colors`}>
        <div className={`p-5 flex items-center gap-3 border-b ${isDarkMode ? 'border-slate-800/60' : 'border-slate-200'}`}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30">KP</div>
          <div><h1 className="text-base font-extrabold tracking-tight">KraftPilot</h1><span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">Enterprise</span></div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-medium">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Pilotage</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('dashboard')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><LayoutDashboard className="w-4 h-4" /> Vue d'ensemble</button>
              <button onClick={() => setVueActuelle('finances')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'finances' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Wallet className="w-4 h-4" /> Trésorerie</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Gestion Commerciale</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('crm')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'crm' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><BarChart3 className="w-4 h-4" /> Tunnel CRM</button>
              <button onClick={() => { setProspectSelectionne(null); setVueActuelle('clients'); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'clients' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Users className="w-4 h-4" /> Répertoire Clients</button>
              <button onClick={() => setVueActuelle('devis')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><FileText className="w-4 h-4" /> Propositions Devis</button>
              <button onClick={() => setVueActuelle('factures')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Receipt className="w-4 h-4" /> Facturation</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Paramétrage</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('chat')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><MessageSquare className="w-4 h-4" /> Simulateur Assistant IA</button>
              <button onClick={() => setVueActuelle('reglages')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'reglages' ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-900/20' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Settings className="w-4 h-4" /> Configuration</button>
            </nav>
          </div>
        </div>

        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800/60 bg-[#0a0f1d]/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-500/40 flex items-center justify-center text-emerald-500 font-bold text-xs uppercase">{artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0) : 'P'}</div>
            <div className="overflow-hidden"><p className="text-xs font-semibold truncate">{artisanConnecte?.nom_entreprise || 'Mon Entreprise'}</p><p className="text-[10px] text-slate-400">Compte Actif</p></div>
          </div>
          <Button onClick={deconnexion} variant="outline" className={`w-full bg-transparent ${isDarkMode ? 'border-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'border-slate-300 text-slate-600 hover:text-red-600 hover:bg-red-50'} text-xs h-8`}><LogOut className="w-3 h-3 mr-1.5" /> Déconnexion</Button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className={`flex-1 p-6 lg:p-10 overflow-y-auto relative z-0 ${isDarkMode ? 'bg-[#0a0f1d]' : 'bg-slate-100'} transition-colors`}>
        
        {/* TOP BAR */}
        <header className={`mb-8 flex items-center justify-between gap-4 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/60' : 'bg-white/80 border-slate-200 shadow-sm'} p-4 rounded-2xl border backdrop-blur-sm shadow-md transition-colors relative z-50`}>
          
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input 
              ref={searchInputRef}
              value={rechercheGlobale}
              onChange={(e) => setRechercheGlobale(e.target.value)}
              placeholder="Rechercher client, problème... (Ctrl + K)" 
              className={`h-10 pl-10 pr-10 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} rounded-xl text-xs w-full focus:border-emerald-500`} 
            />
            {rechercheGlobale && (
              <button onClick={() => setRechercheGlobale('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                <X className="w-4 h-4"/>
              </button>
            )}

            {resultatsRechercheGlobale.length > 0 && (
              <div className={`absolute left-0 right-0 mt-2 ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl z-[999] max-h-64 overflow-y-auto`}>
                <div className="p-2 border-b border-slate-700/50 text-[10px] text-slate-400 uppercase tracking-wider font-bold">Clients correspondants</div>
                {resultatsRechercheGlobale.map(client => (
                  <div 
                    key={client.id}
                    onClick={() => { setProspectSelectionne(client); setRechercheGlobale(''); }}
                    className={`p-3 text-xs cursor-pointer ${isDarkMode ? 'hover:bg-slate-800/60 border-slate-800/50' : 'hover:bg-slate-100 border-slate-100'} border-b flex items-center justify-between`}
                  >
                    <div>
                      <p className="font-bold">{client.nom}</p>
                      <p className="text-[10px] text-slate-400">{client.probleme} • {client.telephone}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-medium">Ouvrir</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            
            <div className="relative">
              <button 
                onClick={() => { setMenuNotifOuvert(!menuNotifOuvert); setMenuProfilOuvert(false); }}
                className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900'} border flex items-center justify-center hover:border-emerald-500/50 transition-all relative`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {menuNotifOuvert && (
                <div className={`absolute right-0 mt-3 w-80 ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl z-[999] overflow-hidden animate-in fade-in duration-150`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Notifications</h4>
                    <span className="text-[10px] text-emerald-500 font-semibold cursor-pointer hover:underline" onClick={() => setMenuNotifOuvert(false)}>Tout marquer comme lu</span>
                  </div>
                  <div className="p-6 text-center space-y-3">
                    <div className={`w-10 h-10 mx-auto rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'} flex items-center justify-center`}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400">Aucune notification pour le moment</p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-[#0a0f1d] border-slate-800 text-amber-400 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-emerald-500/50'} border flex items-center justify-center transition-all`}
              title="Basculer le thème"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => { setMenuProfilOuvert(!menuProfilOuvert); setMenuNotifOuvert(false); }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30 cursor-pointer overflow-hidden border border-emerald-400/50"
              >
                {artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0).toUpperCase() : 'P'}
              </button>

              {menuProfilOuvert && (
                <div className={`absolute right-0 mt-3 w-72 ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl z-[999] overflow-hidden animate-in fade-in duration-150 text-xs`}>
                  <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center gap-3`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shrink-0">
                      {artisanConnecte?.nom_entreprise ? artisanConnecte.nom_entreprise.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold truncate">{artisanConnecte?.nom_entreprise || 'Mon Entreprise'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{artisanConnecte?.email || 'pro@kraftpilot.com'}</p>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { setVueActuelle('reglages'); setMenuProfilOuvert(false); }} 
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} transition-colors`}
                    >
                      <SettingsIcon className="w-4 h-4 text-emerald-500" /> Gérer l'entreprise
                    </button>
                    <button 
                      onClick={() => { setVueActuelle('reglages'); setMenuProfilOuvert(false); }} 
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100'} transition-colors`}
                    >
                      <User className="w-4 h-4 text-emerald-500" /> Paramètres du compte
                    </button>
                  </div>

                  <div className={`p-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button 
                      onClick={deconnexion} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium"
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
                <h2 className="text-2xl font-black tracking-tight">Tableau de bord</h2>
                <p className="text-xs text-slate-400 mt-1">Vue d'ensemble de votre activité professionnelle.</p>
              </div>
              <div className="flex items-center">
                <select 
                  value={anneeSelectionnee} 
                  onChange={(e) => setAnneeSelectionnee(e.target.value)}
                  className={`${isDarkMode ? 'bg-[#111827] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'} border text-xs font-semibold rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 shadow-lg cursor-pointer`}
                >
                  {anneesDisponibles.map((an) => (
                    <option key={an} value={an}>{an}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card onClick={() => setVueActuelle('finances')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">CA Total ({anneeSelectionnee})</p>
                    <h3 className="text-2xl font-extrabold mt-1">{totalCA}€</h3>
                    <p className="text-[10px] text-emerald-500 mt-1">0 factures payées</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500"><Euro className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('finances')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">CA en Attente</p>
                    <h3 className="text-2xl font-extrabold mt-1">{caEnAttente}€</h3>
                    <p className="text-[10px] text-blue-500 mt-1">Factures non payées</p>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500"><Clock className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('finances')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-red-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Impayés</p>
                    <h3 className="text-2xl font-extrabold text-red-500 mt-1">0€</h3>
                    <p className="text-[10px] text-red-500 mt-1">0 facture(s) en retard</p>
                  </div>
                  <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500"><ShieldAlert className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('crm')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Taux Conversion</p>
                    <h3 className="text-2xl font-extrabold mt-1">{tauxConversion}%</h3>
                    <p className="text-[10px] text-emerald-500 mt-1">Devis ➔ Facture</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500"><TrendingUp className="w-5 h-5"/></div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card onClick={() => setVueActuelle('devis')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Devis créés</p>
                    <h3 className="text-2xl font-extrabold mt-1">{prospectsAnnee.length}</h3>
                    <p className="text-[10px] text-blue-500 mt-1">Propositions envoyées</p>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500"><FileText className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('factures')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Factures émises</p>
                    <h3 className="text-2xl font-extrabold mt-1">0</h3>
                    <p className="text-[10px] text-emerald-500 mt-1">Documents générés</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500"><Receipt className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('clients')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Clients actifs</p>
                    <h3 className="text-2xl font-extrabold mt-1">{prospectsActifs.length}</h3>
                    <p className="text-[10px] text-emerald-500 mt-1">En cours de traitement</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500"><Users className="w-5 h-5"/></div>
                </div>
              </Card>

              <Card onClick={() => setVueActuelle('clients')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-xl rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:scale-[1.02] cursor-pointer`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Photos chantier</p>
                    <h3 className="text-2xl font-extrabold mt-1">0</h3>
                    <p className="text-[10px] text-purple-500 mt-1">Médias enregistrés</p>
                  </div>
                  <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500"><Package className="w-5 h-5"/></div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all hover:border-emerald-500/40`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><Target className="w-5 h-5"/></div>
                    <h3 className="text-sm font-bold">Pipeline CRM</h3>
                  </div>
                  <Button onClick={() => setVueActuelle('crm')} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-8">Voir CRM →</Button>
                </div>
                <div>
                  <h4 className="text-2xl font-extrabold text-emerald-500">{caEnAttente}€</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Total pipeline actif</p>
                </div>
                <div className={`grid grid-cols-3 gap-2 mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-800 bg-[#0a0f1d]' : 'border-slate-100 bg-slate-50'} text-center rounded-xl p-2`}>
                  <div><span className="block text-xs font-bold text-blue-500">{prospectsActifs.length} leads</span></div>
                  <div><span className="block text-xs font-bold text-emerald-500">0 devis</span></div>
                  <div><span className="block text-xs font-bold text-emerald-500">0 gagnés</span></div>
                </div>
              </Card>

              <div className={`lg:col-span-2 ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border p-6 rounded-2xl shadow-xl flex flex-col justify-between`}>
                <h3 className="text-sm font-bold mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button onClick={() => setModalAjoutOuvert(true)} className={`${isDarkMode ? 'bg-[#0a0f1d] hover:bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'} border h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group`}>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500/20 transition-colors"><FileText className="w-6 h-6"/></div>
                    <span>Nouveau devis</span>
                  </Button>
                  <Button onClick={() => setModalAjoutOuvert(true)} className={`${isDarkMode ? 'bg-[#0a0f1d] hover:bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'} border h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group`}>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500/20 transition-colors"><Receipt className="w-6 h-6"/></div>
                    <span>Nouvelle facture</span>
                  </Button>
                  <Button onClick={() => setModalAjoutOuvert(true)} className={`${isDarkMode ? 'bg-[#0a0f1d] hover:bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'} border h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group`}>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500/20 transition-colors"><Users className="w-6 h-6"/></div>
                    <span>Ajouter client</span>
                  </Button>
                  <Button onClick={() => setVueActuelle('clients')} className={`${isDarkMode ? 'bg-[#0a0f1d] hover:bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'} border h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group`}>
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:bg-purple-500/20 transition-colors"><Package className="w-6 h-6"/></div>
                    <span>Photos chantier</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Évolution du CA ({anneeSelectionnee})</h3>
                  <span className="text-xs font-bold text-emerald-500">Total {totalCA}€</span>
                </div>
                <div className={`h-48 relative flex items-end justify-between px-2 pt-6 pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
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
                        <div className="absolute bottom-0 w-[1px] h-full bg-emerald-500/80 z-0"></div>
                      )}
                      <div className={`w-2.5 h-2.5 rounded-full z-10 transition-all ${hoverIndexCa === idx ? 'bg-emerald-500 scale-125 ring-4 ring-emerald-500/20' : 'bg-transparent'}`}></div>
                      
                      {hoverIndexCa === idx && (
                        <div className={`absolute bottom-12 z-30 ${isDarkMode ? 'bg-[#162032] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xl'} border p-3 rounded-xl text-xs w-28 text-center animate-in fade-in duration-150`}>
                          <p className="font-bold capitalize">{mois}</p>
                          <p className="text-emerald-500 font-extrabold mt-1">CA : 0€</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="absolute bottom-2 left-6 right-0 h-[2px] bg-emerald-500"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-3 pl-6">
                  {MOIS_ANNEE.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              </Card>

              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl relative overflow-hidden transition-all hover:border-emerald-500/30`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Activité mensuelle ({anneeSelectionnee})</h3>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Factures</span>
                    <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Devis</span>
                  </div>
                </div>
                <div className={`h-48 relative flex items-end justify-between px-2 pt-6 pb-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
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
                        <div className={`absolute bottom-0 w-6 h-full ${isDarkMode ? 'bg-slate-700/40' : 'bg-slate-200'} rounded-t z-0`}></div>
                      )}
                      
                      {hoverIndexAct === idx && (
                        <div className={`absolute bottom-12 z-30 ${isDarkMode ? 'bg-[#162032] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-xl'} border p-3 rounded-xl text-xs w-32 text-left animate-in fade-in duration-150`}>
                          <p className="font-bold capitalize mb-1">{mois}</p>
                          <p className="text-blue-500 font-semibold">Devis : 0</p>
                          <p className="text-emerald-500 font-semibold mt-0.5">Factures : 0</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 pt-3 pl-6">
                  {MOIS_ANNEE.map((m, i) => <span key={i}>{m}</span>)}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl h-64 flex flex-col justify-between transition-all hover:border-emerald-500/30`}>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500"/><h3 className="text-sm font-bold">Top 5 clients ({anneeSelectionnee})</h3></div>
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl h-64 flex flex-col justify-between transition-all hover:border-emerald-500/30`}>
                <div className="flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-500"/><h3 className="text-sm font-bold">Répartition des devis ({anneeSelectionnee})</h3></div>
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">Aucune donnée disponible</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card onClick={() => setVueActuelle('factures')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer`}>
                <p className="text-xs text-slate-400 font-medium">Facture moyenne</p>
                <h4 className="text-3xl font-black text-emerald-500 mt-2">{factureMoyenne}€</h4>
              </Card>
              <Card onClick={() => setVueActuelle('crm')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer`}>
                <p className="text-xs text-slate-400 font-medium">Taux de conversion</p>
                <h4 className="text-3xl font-black text-emerald-500 mt-2">{tauxConversion}%</h4>
              </Card>
              <Card onClick={() => setVueActuelle('clients')} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} p-6 rounded-2xl shadow-xl text-center transition-all hover:scale-[1.02] hover:border-emerald-500/40 cursor-pointer`}>
                <p className="text-xs text-slate-400 font-medium">Clients actifs</p>
                <h4 className="text-3xl font-black text-blue-500 mt-2">{prospectsActifs.length}</h4>
              </Card>
            </div>
          </div>
        )}

        {/* NOUVEAU MODULE CRM PIPELINE AVEC DRAWER COULISSANT */}
        {vueActuelle === 'crm' && (
          <div className="space-y-6 animate-in fade-in duration-300 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
                  <Target className="w-6 h-6"/>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Tunnel CRM & Pipeline</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Pipeline total actif: <span className="text-violet-400 font-extrabold">{caEnAttente} €</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => chargerProspects(false)} variant="outline" className={`h-10 text-xs gap-2 ${isDarkMode ? 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700'} rounded-xl`}>
                  <RefreshCw className="w-3.5 h-3.5"/> Actualiser
                </Button>
                <Button onClick={() => setModalAjoutOuvert(true)} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Nouveau devis
                </Button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#111827]/80 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4`}>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <Input 
                  value={rechercheCrm}
                  onChange={(e) => setRechercheCrm(e.target.value)}
                  placeholder="Rechercher dans les deals..." 
                  className={`h-10 pl-10 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} rounded-xl text-xs w-full focus:border-violet-500`} 
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  value={filtreStageCrm} 
                  onChange={(e) => setFiltreStageCrm(e.target.value)}
                  className={`h-10 px-4 rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border outline-none cursor-pointer focus:border-violet-500 flex-1 md:w-48`}
                >
                  <option value="Tous les stages">Tous les stages</option>
                  <option value="Lead">Lead</option>
                  <option value="Contacté">Contacté</option>
                  <option value="Devis envoyé">Devis envoyé</option>
                  <option value="Gagné">Gagné</option>
                  <option value="Perdu">Perdu</option>
                </select>

                <select 
                  value={filtrePeriodeCrm} 
                  onChange={(e) => setFiltrePeriodeCrm(e.target.value)}
                  className={`h-10 px-4 rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border outline-none cursor-pointer focus:border-violet-500 flex-1 md:w-40`}
                >
                  <option value="Tout">Tout</option>
                  <option value="Ce mois">Ce mois</option>
                  <option value="Ce trimestre">Ce trimestre</option>
                  <option value="Cette année">Cette année</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
              <div className={`${isDarkMode ? 'bg-[#111827] border-indigo-500/20' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[240px]`}>
                <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-transparent border-b border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-extrabold text-indigo-400">Lead</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-black px-2.5 py-0.5 rounded-full">{prospectsActifs.length}</span>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-3 min-h-[220px]">
                  {prospectsActifs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center"><p className="text-xs text-slate-500 font-medium">Aucun deal</p></div>
                  ) : (
                    prospectsActifs.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => setDealSelectionneCrm(client)}
                        className="p-3 bg-[#0a0f1d] border border-indigo-500/30 rounded-xl space-y-1.5 shadow-md text-xs cursor-pointer hover:border-indigo-400 transition-all"
                      >
                        <div className="flex items-center justify-between"><span className="font-bold text-white">Lead - {client.nom}</span><span className="text-[10px] text-amber-400 font-semibold">-{prixMoyenDemande}€</span></div>
                        <p className="text-[10px] text-slate-400"><Users className="w-3 h-3 inline mr-1"/>{client.nom}</p>
                        <p className="text-[9px] text-slate-500">il y a quelques minutes</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-[#111827] border-purple-500/20' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[240px]`}>
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                    <span className="text-xs font-extrabold text-purple-400">Contacté</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-black px-2.5 py-0.5 rounded-full">0</span>
                </div>
                <div className="p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <p className="text-xs text-slate-500 font-medium">Aucun deal</p>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-[#111827] border-cyan-500/20' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[240px]`}>
                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-transparent border-b border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                    <span className="text-xs font-extrabold text-cyan-400">Devis envoyé</span>
                  </div>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-black px-2.5 py-0.5 rounded-full">0</span>
                </div>
                <div className="p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <p className="text-xs text-slate-500 font-medium">Aucun deal</p>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-[#111827] border-emerald-500/20' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[240px]`}>
                <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-transparent border-b border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-extrabold text-emerald-400">Gagné</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-full">0</span>
                </div>
                <div className="p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <p className="text-xs text-slate-500 font-medium">Aucun deal</p>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-[#111827] border-rose-500/20' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl overflow-hidden flex flex-col min-w-[240px]`}>
                <div className="p-4 bg-gradient-to-r from-rose-500/10 to-transparent border-b border-rose-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                    <span className="text-xs font-extrabold text-rose-400">Perdu</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-black px-2.5 py-0.5 rounded-full">0</span>
                </div>
                <div className="p-4 flex-1 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <p className="text-xs text-slate-500 font-medium">Aucun deal</p>
                </div>
              </div>
            </div>

            {/* DRAWER LATÉRAL COULISSANT DU CRM AVEC LE BOUTON "VOIR LA FICHE CLIENT" FONCTIONNEL */}
            {dealSelectionneCrm && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
                <div className={`w-full max-w-md ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} h-full border-l shadow-2xl flex flex-col justify-between overflow-y-auto p-6 animate-in slide-in-from-right duration-200`}>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                      <div>
                        <h3 className="text-base font-extrabold">Lead - {dealSelectionneCrm.nom}</h3>
                        <p className="text-xs text-amber-400 font-semibold mt-0.5">-{prixMoyenDemande}€</p>
                      </div>
                      <Button variant="ghost" onClick={() => setDealSelectionneCrm(null)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 inline-block">Lead</span>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="w-6 h-1.5 rounded-full bg-indigo-500"></div>
                        <div className="w-6 h-1.5 rounded-full bg-slate-800"></div>
                        <div className="w-6 h-1.5 rounded-full bg-slate-800"></div>
                        <div className="w-6 h-1.5 rounded-full bg-slate-800"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client</h4>
                      <div className="bg-[#0a0f1d] border border-slate-800 p-4 rounded-xl space-y-1 text-xs">
                        <p className="font-bold text-white">{dealSelectionneCrm.nom}</p>
                        <p className="text-slate-400">{dealSelectionneCrm.probleme}</p>
                        <p className="text-slate-400">{dealSelectionneCrm.email || 'kenza.boualili2006@gmail.com'}</p>
                        <p className="text-slate-400">{dealSelectionneCrm.telephone}</p>
                        <button 
                          onClick={() => { 
                            setProspectSelectionne(dealSelectionneCrm); 
                            setDealSelectionneCrm(null); 
                          }} 
                          className="text-xs text-amber-400 font-semibold hover:underline pt-2 block"
                        >
                          Voir la fiche client ↗
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</h4>
                      <div className="space-y-2">
                        <textarea placeholder="Ajouter une note..." className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl p-3 text-xs outline-none h-24 resize-none"></textarea>
                        <div className="flex justify-end"><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8">Ajouter</Button></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emails</h4>
                        <Button size="sm" variant="outline" className="h-7 text-xs bg-slate-800 border-slate-700 text-slate-200"><Send className="w-3 h-3 mr-1"/> Envoyer</Button>
                      </div>
                      <div className="bg-[#0a0f1d] border border-slate-800 p-6 rounded-xl text-center text-xs text-slate-500">Aucun email envoyé</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Activités</h4>
                    <p className="text-xs text-slate-500">Aucune activité récente</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOUVEAU MODULE RÉPERTOIRE CLIENTS AVEC MENU D'ACTIONS PROPRE */}
        {vueActuelle === 'clients' && !prospectSelectionne && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Clients</h2>
                <p className="text-xs text-slate-400 mt-1">Gérez vos clients et leurs informations</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => alert("Export CSV réussi !")} className={`h-10 text-xs gap-2 ${isDarkMode ? 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700'} rounded-xl`}>
                  <Download className="w-3.5 h-3.5"/> Exporter CSV
                </Button>
                <Button variant="outline" onClick={() => alert("Import CSV réussi !")} className={`h-10 text-xs gap-2 ${isDarkMode ? 'bg-[#111827] border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700'} rounded-xl`}>
                  <Upload className="w-3.5 h-3.5"/> Importer CSV
                </Button>
                <Button onClick={() => setModalNouveauClientOuvert(true)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-amber-900/20 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Nouveau client
                </Button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#111827]/80 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4`}>
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <Input 
                  value={rechercheClientInput}
                  onChange={(e) => setRechercheClientInput(e.target.value)}
                  placeholder="Rechercher un client..." 
                  className={`h-10 pl-10 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} rounded-xl text-xs w-full focus:border-amber-500`} 
                />
              </div>
              <div className="w-full md:w-48">
                <select 
                  value={filtreStatutClient}
                  onChange={(e) => setFiltreStatutClient(e.target.value)}
                  className={`h-10 px-4 w-full rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border outline-none cursor-pointer focus:border-amber-500`}
                >
                  <option value="Tous">Tous</option>
                  <option value="Actifs">Actifs</option>
                  <option value="Inactifs">Inactifs</option>
                </select>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl overflow-hidden shadow-xl`}>
              <table className="w-full text-left text-xs text-slate-400">
                <thead className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-800' : 'bg-slate-50 border-slate-200'} uppercase font-semibold border-b`}>
                  <tr>
                    <th className="px-6 py-4">Nom</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Ville</th>
                    <th className="px-6 py-4">Devis</th>
                    <th className="px-6 py-4">Factures</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {prospects.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-500">Aucun client dans votre répertoire. Cliquez sur "Nouveau client" pour commencer.</td>
                    </tr>
                  ) : (
                    prospects.filter(p => {
                      if (rechercheClientInput.trim() !== '') {
                        const term = rechercheClientInput.toLowerCase();
                        const matchNom = p.nom && p.nom.toLowerCase().includes(term);
                        const matchTel = p.telephone && p.telephone.toLowerCase().includes(term);
                        if (!matchNom && !matchTel) return false;
                      }
                      if (filtreStatutClient === 'Actifs' && p.statut === 'archive') return false;
                      if (filtreStatutClient === 'Inactifs' && p.statut !== 'archive') return false;
                      return true;
                    }).map(p => {
                      const estInactif = p.statut === 'archive';
                      return (
                        <tr 
                          key={p.id} 
                          onClick={() => setProspectSelectionne(p)}
                          className={`${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition-colors cursor-pointer relative`}
                        >
                          <td className="px-6 py-4 font-bold text-white text-sm">{p.nom}</td>
                          <td className="px-6 py-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-slate-300"><Mail className="w-3 h-3 text-amber-400"/> {p.email || 'kenza.boualili2006@gmail.com'}</div>
                            <div className="flex items-center gap-1.5 text-slate-400"><Phone className="w-3 h-3"/> {p.telephone}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-300"><MapPin className="w-3 h-3 inline mr-1 text-amber-400"/> {p.ville || 'Poissy'}</td>
                          <td className="px-6 py-4 text-slate-300 font-semibold"><FileText className="w-3.5 h-3.5 inline mr-1 text-blue-400"/> 0</td>
                          <td className="px-6 py-4 text-slate-300 font-semibold"><Receipt className="w-3.5 h-3.5 inline mr-1 text-emerald-400"/> 0</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${estInactif ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                              {estInactif ? 'Inactif' : 'Actif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                            {/* BOUTON ROND AVEC 3 PETITS POINTS CORRIGÉ */}
                            <Button 
                              variant="outline" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuActionClientId(menuActionClientId === p.id ? null : p.id);
                              }} 
                              className={`h-9 w-9 p-0 rounded-full ${isDarkMode ? 'bg-[#1a2333] border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800'} shadow-md`}
                            >
                              <MoreHorizontal className="w-4 h-4 pointer-events-none"/>
                            </Button>

                            {/* MENU DÉROULANT DES ACTIONS */}
                            {menuActionClientId === p.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-12 top-14 w-44 ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-2xl shadow-2xl z-50 overflow-hidden text-xs py-1 text-left animate-in fade-in duration-150`}
                              >
                                <button 
                                  onClick={() => { setProspectSelectionne(p); setMenuActionClientId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400"/> Voir détails
                                </button>
                                <button 
                                  onClick={() => {
                                    setFormModifClient({
                                      id: p.id,
                                      nom: p.nom,
                                      email: p.email || 'kenza.boualili2006@gmail.com',
                                      telephone: p.telephone,
                                      entreprise: p.entreprise || '',
                                      adresse: p.adresse || '',
                                      code_postal: '78300',
                                      ville: 'Poissy',
                                      siret: ''
                                    });
                                    setModalModifierClientOuvert(true);
                                    setMenuActionClientId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-400"/> Modifier
                                </button>
                                <button 
                                  onClick={() => basculerStatutClient(p.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <UserX className="w-3.5 h-3.5 text-slate-400"/> {estInactif ? 'Réactiver' : 'Désactiver'}
                                </button>
                                <button 
                                  onClick={() => supprimerClient(p.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors font-medium border-t border-slate-800/60"
                                >
                                  <Trash2 className="w-3.5 h-3.5"/> Supprimer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
