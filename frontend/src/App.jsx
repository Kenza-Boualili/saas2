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
        setModalAjoutOuvert(false);
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
                <div><label className="text-xs text-slate-400 font-medium">Nom du client</label><Input value={formNouveauClient.nom} onChange={e => setFormNouveauClient({...formNouveauClient, nom: e.target.value})} placeholder="ex: Jean Dupont" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                <div><label className="text-xs text-slate-400 font-medium">Prestation / Problème</label><Input value={formNouveauClient.notes} onChange={e => setFormNouveauClient({...formNouveauClient, notes: e.target.value})} placeholder="ex: Fuite d'eau" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs text-slate-400 font-medium">Téléphone</label><Input value={formNouveauClient.telephone} onChange={e => setFormNouveauClient({...formNouveauClient, telephone: e.target.value})} placeholder="06 12 34 56 78" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
                  <div><label className="text-xs text-slate-400 font-medium">Statut</label><select value={formNouveauClient.statut} onChange={e => setFormNouveauClient({...formNouveauClient, statut: e.target.value})} className={`w-full ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-md px-3 h-10 text-xs mt-1 outline-none`}><option value="Actif">Actif</option><option value="Inactif">Inactif</option></select></div>
                </div>
                <div><label className="text-xs text-slate-400 font-medium">Adresse complète</label><Input value={formNouveauClient.adresse} onChange={e => setFormNouveauClient({...formNouveauClient, adresse: e.target.value})} placeholder="12 rue de Paris, 75001 Paris" className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-sm mt-1`} required /></div>
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
                  email: prospectSelectionne.email || '',
                  telephone: prospectSelectionne.telephone,
                  entreprise: prospectSelectionne.entreprise || '',
                  adresse: prospectSelectionne.adresse || '',
                  code_postal: '',
                  ville: '',
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
                  <div className="flex items-center gap-3 text-slate-300"><Mail className="w-4 h-4 text-amber-400 shrink-0"/> <span>{prospectSelectionne.email || 'N/A'}</span></div>
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
              <button onClick={() => setVueActuelle('devis')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'devis' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><FileText className="w-4 h-4" /> Propositions Devis</button>
              <button onClick={() => setVueActuelle('factures')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'factures' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Receipt className="w-4 h-4" /> Facturation</button>
             <button onClick={() => setVueActuelle('avoirs')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'avoirs' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}><FileText className="w-4 h-4" /> Avoirs</button>
            <button onClick={() => setVueActuelle('fournisseurs')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'fournisseurs' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Truck className="w-4 h-4" /> Fournisseurs</button>
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-2">Paramétrage</p>
            <nav className="space-y-1">
              <button onClick={() => setVueActuelle('chat')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${vueActuelle === 'chat' ? 'bg-emerald-500 text-slate-950 font-bold' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><MessageSquare className="w-4 h-4" /> Simulateur Assistant IA</button>
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
                    onClick={() => { setProspectSelectionne(client); setVueActuelle('clients'); setRechercheGlobale(''); }}
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
                  <Button onClick={() => setModalNouveauClientOuvert(true)} className={`${isDarkMode ? 'bg-[#0a0f1d] hover:bg-slate-800/80 border-slate-800 text-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'} border h-32 text-xs font-semibold flex flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:scale-[1.02] shadow-md group`}>
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

            {/* DRAWER LATÉRAL COULISSANT DU CRM */}
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
                        <p className="text-slate-400">{dealSelectionneCrm.email || 'N/A'}</p>
                        <p className="text-slate-400">{dealSelectionneCrm.telephone}</p>
                        <button 
                          onClick={() => { 
                            setProspectSelectionne(dealSelectionneCrm); 
                            setDealSelectionneCrm(null);
                            setVueActuelle('clients');
                          }} 
                          className="text-xs text-amber-400 font-semibold hover:underline pt-2 block"
                        >
                          Voir la fiche client ↗
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOUVEAU MODULE RÉPERTOIRE CLIENTS */}
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

            <div className={`${isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'} border rounded-2xl shadow-xl`}>
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
                            <div className="flex items-center gap-1.5 text-slate-300"><Mail className="w-3 h-3 text-amber-400"/> {p.email || 'N/A'}</div>
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
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuActionClientId(menuActionClientId === p.id ? null : p.id);
                              }} 
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all outline-none ${
                                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4 pointer-events-none"/>
                            </button>

                            {menuActionClientId === p.id && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className={`absolute right-8 top-10 w-44 ${isDarkMode ? 'bg-[#111827] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl shadow-2xl z-[9999] overflow-hidden text-xs py-1 text-left animate-in fade-in zoom-in-95 duration-150`}
                              >
                                <button 
                                  onClick={() => { setProspectSelectionne(p); setMenuActionClientId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <Eye className="w-4 h-4 text-slate-400"/> Voir détails
                                </button>
                                <button 
                                  onClick={() => {
                                    setFormModifClient({
                                      id: p.id,
                                      nom: p.nom,
                                      email: p.email || '',
                                      telephone: p.telephone,
                                      entreprise: p.entreprise || '',
                                      adresse: p.adresse || '',
                                      code_postal: '',
                                      ville: '',
                                      siret: ''
                                    });
                                    setModalModifierClientOuvert(true);
                                    setMenuActionClientId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4 text-slate-400"/> Modifier
                                </button>
                                <button 
                                  onClick={() => basculerStatutClient(p.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-800/60 transition-colors"
                                >
                                  <UserX className="w-4 h-4 text-slate-400"/> {estInactif ? 'Réactiver' : 'Désactiver'}
                                </button>
                                <button 
                                  onClick={() => supprimerClient(p.id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 text-red-500 transition-colors font-medium border-t border-slate-800/60"
                                >
                                  <Trash2 className="w-4 h-4"/> Supprimer
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

        {/* MODULES SECONDAIRES (Trésorerie, Devis, Factures, Chat, Réglages) */}
        {vueActuelle === 'finances' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Dashboard Financier</h2>
              <p className="text-xs text-slate-400 mt-1">Accédez à des analyses financières avancées : balance âgée, DSO, comparaison annuelle et suivi des créances clients.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl`}>
                <p className="text-xs text-slate-400">DSO (Days Sales Outstanding)</p>
                <h3 className="text-2xl font-extrabold mt-1">0 jours</h3>
                <p className="text-[10px] text-emerald-500 mt-1">Délai moyen de paiement</p>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl`}>
                <p className="text-xs text-slate-400">Créances clients</p>
                <h3 className="text-2xl font-extrabold mt-1">0,00 €</h3>
                <p className="text-[10px] text-blue-500 mt-1">Total à recouvrer</p>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl`}>
                <p className="text-xs text-slate-400">Comparaison Annuelle</p>
                <h3 className="text-2xl font-extrabold mt-1">+0%</h3>
                <p className="text-[10px] text-emerald-500 mt-1">vs année précédente</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl space-y-4`}>
                <h3 className="text-sm font-bold border-b border-slate-800 pb-3">Balance âgée</h3>
                <div className="text-center py-12 text-xs text-slate-500">Aucune donnée de balance âgée disponible.</div>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl space-y-4`}>
                <h3 className="text-sm font-bold border-b border-slate-800 pb-3">Suivi des créances clients</h3>
                <div className="text-center py-12 text-xs text-slate-500">Aucune créance en cours.</div>
              </Card>
            </div>
          </div>
        )}

       {/* MODULE DEVIS & CRÉATION DE DEVIS AVEC DESIGN AVANCÉ */}
        {vueActuelle === 'devis' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Si aucun devis en cours de création, on affiche la liste ou le vide */}
            {!window.modeCreationDevis ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white">Devis</h2>
                    <p className="text-xs text-slate-400 mt-1">Gérez vos devis et propositions commerciales</p>
                  </div>
                  <Button onClick={() => window.modeCreationDevis = true} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-amber-900/20 flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Nouveau devis
                  </Button>
                </div>

                <div className={`${isDarkMode ? 'bg-[#111827]/80 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4`}>
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <Input placeholder="Rechercher un devis ou client..." className={`h-10 pl-10 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} rounded-xl text-xs w-full`} />
                  </div>
                  <div className="w-full md:w-48">
                    <select className={`h-10 px-4 w-full rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} border outline-none cursor-pointer`}>
                      <option value="Tous">Tous</option>
                      <option value="Brouillon">Brouillon</option>
                      <option value="Envoyé">Envoyé</option>
                      <option value="Accepté">Accepté</option>
                    </select>
                  </div>
                </div>

                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-12 rounded-2xl shadow-xl text-center space-y-4`}>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <FileText className="w-8 h-8"/>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Aucun devis</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Créez votre premier devis en quelques clics et commencez à gérer votre activité.</p>
                  </div>
                  <Button onClick={() => window.modeCreationDevis = true} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-amber-900/20">
                    <Plus className="w-4 h-4 mr-2"/> Créer mon premier devis
                  </Button>
                </Card>
              </div>
            ) : (
              /* FORMULAIRE DE CRÉATION DE DEVIS INNOVANT ET COMPLET */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => window.modeCreationDevis = false} className="bg-slate-800/50 border-slate-700 text-slate-200 h-9 text-xs">← Retour</Button>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white">Nouveau devis</h2>
                      <p className="text-xs text-slate-400">Créez un devis pour votre client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => alert("Pack ajouté !")} className="bg-[#111827] border-slate-700 text-slate-200 text-xs h-9"><Plus className="w-3.5 h-3.5 mr-1.5"/> Ajouter un pack</Button>
                    <Button variant="outline" onClick={() => alert("Template chargé !")} className="bg-[#111827] border-slate-700 text-slate-200 text-xs h-9"><FileText className="w-3.5 h-3.5 mr-1.5"/> Utiliser un template</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bloc Informations Générales */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white">Informations générales</h3>
                        <p className="text-xs text-slate-400">Sélectionnez le client et les dates</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium">Client</label>
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-400 text-xs flex items-center justify-between">
                          <span>Aucun client trouvé. Créez votre premier client ci-dessous pour commencer.</span>
                        </div>
                        <div onClick={() => setModalNouveauClientOuvert(true)} className="border border-dashed border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer p-4 rounded-xl flex items-center gap-3 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">+</div>
                          <div>
                            <p className="text-xs font-bold text-blue-400">Créer un nouveau client</p>
                            <p className="text-[10px] text-slate-400">Ajout rapide sans quitter la page</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Date du devis</label>
                          <Input defaultValue="28/07/2026" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-xs mt-1"/>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Valide jusqu'au</label>
                          <Input defaultValue="27/08/2026" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-xs mt-1"/>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 font-medium block mb-2">Taux de TVA</label>
                        <div className="flex flex-wrap gap-2">
                          {['0%', '2.1%', '5.5%', '10%', '20%', 'Autre'].map((tva, idx) => (
                            <button key={idx} type="button" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${tva === '20%' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-[#0a0f1d] text-slate-300 border-slate-700 hover:border-slate-500'}`}>{tva}</button>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5">Ce taux sera appliqué à l'ensemble du devis</p>
                      </div>
                    </Card>

                    {/* Bloc Articles et prestations */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">Articles et prestations</h3>
                          <p className="text-xs text-slate-400">Ajoutez les lignes du devis</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => alert("Modale Main d'œuvre ouverte")} className="bg-[#0a0f1d] border-slate-700 text-slate-200 text-xs h-8"><Wrench className="w-3.5 h-3.5 mr-1 text-amber-400"/> Main d'œuvre</Button>
                          <Button variant="outline" onClick={() => alert("Modale Frais kilométriques ouverte")} className="bg-[#0a0f1d] border-slate-700 text-slate-200 text-xs h-8"><Truck className="w-3.5 h-3.5 mr-1 text-amber-400"/> Frais kilométriques</Button>
                          <Button variant="outline" onClick={() => alert("Ligne vide ajoutée")} className="bg-[#111827] border-slate-700 text-slate-200 text-xs h-8"><Plus className="w-3.5 h-3.5 mr-1"/> Ligne vide</Button>
                        </div>
                      </div>

                      <div className="space-y-4 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Sélectionner un produit...</label>
                          <select className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                            <option>Sélectionner un produit...</option>
                            <option>Installation tableau électrique</option>
                            <option>Recherche de fuite</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Description</label>
                          <Input placeholder="Ex: Installation tableau électrique" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Quantité</label>
                            <Input defaultValue="1" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Unité</label>
                            <Input defaultValue="unité" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Prix unitaire HT</label>
                            <Input defaultValue="0.00" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">TVA</label>
                            <select className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                              <option>20% - Taux normal</option>
                              <option>10% - Rénovation</option>
                              <option>5.5% - Énergétique</option>
                              <option>0% - Exonéré</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Bloc Photos du chantier */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">Photos du chantier</h3>
                          <p className="text-xs text-slate-400">Ajoutez des photos avant, pendant ou après les travaux</p>
                        </div>
                        <Button onClick={() => alert("Ajout de photos...")} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-amber-900/20">
                          <Plus className="w-4 h-4 mr-1.5"/> Ajouter des photos
                        </Button>
                      </div>
                      <div className="border border-dashed border-slate-800 p-8 rounded-xl text-center text-xs text-slate-500">
                        Sélectionnez un client et cliquez sur "Ajouter des photos" pour commencer
                      </div>
                    </Card>

                    {/* Bloc Notes et conditions */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Notes et conditions</h3>
                        <p className="text-xs text-slate-400">Informations complémentaires</p>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-400 font-medium">Notes internes (facultatif)</label>
                          <textarea placeholder="Informations complémentaires, instructions particulières..." className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl p-3 h-20 mt-1 outline-none resize-none"></textarea>
                        </div>
                        <div>
                          <label className="text-slate-400 font-medium">Conditions générales</label>
                          <textarea placeholder="Conditions de paiement et générales..." className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl p-3 h-24 mt-1 outline-none resize-none"></textarea>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Panneau Récapitulatif Fixe à droite */}
                  <div className="space-y-6">
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 sticky top-6">
                      <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Récapitulatif</h3>
                      <div className="space-y-2 text-xs text-slate-300 border-b border-slate-800 pb-4">
                        <p className="font-semibold text-white">Sans description</p>
                        <p className="text-slate-400">Qté: 1 unité × 0,00 € = 0,00 €</p>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Total HT</span><span className="font-bold text-white">0,00 €</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">TVA (20%)</span><span className="font-bold text-white">0,00 €</span></div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-800"><span className="font-extrabold text-white">Total TTC</span><span className="font-black text-amber-400 text-lg">0,00 €</span></div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Button onClick={() => { alert("Devis créé avec succès !"); window.modeCreationDevis = false; }} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-11 rounded-xl shadow-lg shadow-amber-900/20">
                          <FileText className="w-4 h-4 mr-2"/> Créer le devis
                        </Button>
                        <Button variant="outline" onClick={() => window.modeCreationDevis = false} className="w-full bg-[#0a0f1d] border-slate-700 text-slate-300 hover:text-white text-xs h-10 rounded-xl">
                          Annuler
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {/* MODULE NOTES DE CRÉDIT & REMBOURSSEMENTS (AVOIRS REVISITÉ) */}
        {vueActuelle === 'avoirs' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <FileText className="w-7 h-7 text-indigo-400"/> Notes de Crédit & Remboursements
                </h2>
                <p className="text-xs text-slate-400 mt-1">Suivi et pilotage de vos avoirs émis auprès de vos clients</p>
              </div>
              <Button onClick={() => alert("Redirection vers la sélection des factures pour créer un avoir")} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2">
                <Plus className="w-4 h-4"/> Émettre un avoir
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-indigo-500`}>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total émis</p>
                  <h3 className="text-2xl font-black mt-1 text-indigo-400">0</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Notes de crédit créées</p>
                </Card>

                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-amber-500`}>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">En attente / Brouillons</p>
                  <h3 className="text-2xl font-black mt-1 text-amber-400">0</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Non finalisés</p>
                </Card>

                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-emerald-500`}>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Volume Financier</p>
                  <h3 className="text-2xl font-black mt-1 text-emerald-400">0,00 €</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Montant global déduit</p>
                </Card>
              </div>

              <div className="lg:col-span-3 space-y-4">
                <div className={`${isDarkMode ? 'bg-[#111827]/80 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4`}>
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-indigo-400" />
                    <Input placeholder="Filtrer par référence, client ou facture d'origine..." className={`h-10 pl-10 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} rounded-xl text-xs w-full focus:border-indigo-500`} />
                  </div>
                  <div className="w-full md:w-52">
                    <select className={`h-10 px-4 w-full rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} border outline-none cursor-pointer focus:border-indigo-500 font-semibold text-indigo-400`}>
                      <option value="Tous">⚡ Filtrer l'état</option>
                      <option value="Brouillon">📝 Brouillons</option>
                      <option value="Transmis">📤 Transmis</option>
                      <option value="Déduit">✅ Déduit / Appliqué</option>
                      <option value="Annulé">❌ Annulés</option>
                    </select>
                  </div>
                </div>

                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-16 rounded-2xl shadow-xl text-center space-y-5 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                    <FileText className="w-8 h-8"/>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">Aucune note de crédit enregistrée</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">Les notes de crédit et remboursements sont générés directement depuis vos factures réglées ou en cours.</p>
                  </div>
                  <Button onClick={() => setVueActuelle('factures')} className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl shadow-lg shadow-indigo-900/20">
                    Consulter les factures
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}
        
{/* MODULE FOURNISSEURS & APPROVISIONNEMENT FONCTIONNEL */}
        {vueActuelle === 'fournisseurs' && (
          <div className="space-y-6 animate-in fade-in duration-300 relative">
            
            {/* MODALE AJOUT FOURnisseur */}
            {modalFournisseurOuvert && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className={`w-full max-w-lg ${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'} shadow-2xl rounded-2xl`}>
                  <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-slate-800">
                    <CardTitle className="text-lg font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-cyan-400"/> Nouveau fournisseur</CardTitle>
                    <Button variant="ghost" onClick={() => setModalFournisseurOuvert(false)} className="text-slate-400 hover:text-white rounded-full h-8 w-8 p-0"><X className="w-4 h-4"/></Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!formFournisseur.nom) return;
                      setFournisseurs([...fournisseurs, { ...formFournisseur, id: Date.now() }]);
                      setFormFournisseur({ nom: '', activite: '', email: '', telephone: '' });
                      setModalFournisseurOuvert(false);
                    }} className="space-y-4 text-xs">
                      <div>
                        <label className="text-slate-400 font-medium">Nom de l'entreprise *</label>
                        <Input value={formFournisseur.nom} onChange={e => setFormFournisseur({...formFournisseur, nom: e.target.value})} placeholder="ex: Leroy Merlin Pro" className={`h-10 mt-1 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} required />
                      </div>
                      <div>
                        <label className="text-slate-400 font-medium">Activité / Spécialité</label>
                        <Input value={formFournisseur.activite} onChange={e => setFormFournisseur({...formFournisseur, activite: e.target.value})} placeholder="ex: Matériaux de construction" className={`h-10 mt-1 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 font-medium">Email</label>
                          <Input value={formFournisseur.email} onChange={e => setFormFournisseur({...formFournisseur, email: e.target.value})} placeholder="contact@fournisseur.com" className={`h-10 mt-1 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                        </div>
                        <div>
                          <label className="text-slate-400 font-medium">Téléphone</label>
                          <Input value={formFournisseur.telephone} onChange={e => setFormFournisseur({...formFournisseur, telephone: e.target.value})} placeholder="01 23 45 67 89" className={`h-10 mt-1 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'}`} />
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                        <Button type="button" variant="outline" onClick={() => setModalFournisseurOuvert(false)} className="bg-transparent border-slate-700 text-slate-300 h-10 text-xs">Annuler</Button>
                        <Button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold h-10 px-5 text-xs shadow-lg">Enregistrer</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                    <Truck className="w-5 h-5"/>
                  </div>
                  Gestion des fournisseurs
                </h2>
                <p className="text-xs text-slate-400 mt-1">Centralisez vos fournisseurs et prestataires. Créez des bons de commande professionnels.</p>
              </div>
              <Button onClick={() => setModalFournisseurOuvert(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-extrabold text-xs h-10 px-5 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2">
                <Plus className="w-4 h-4"/> Nouveau fournisseur
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={`${isDarkMode ? 'bg-[#111827] border-cyan-500/20 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-cyan-500`}>
                <p className="text-xs text-slate-400 font-medium">Fournisseurs enregistrés</p>
                <h3 className="text-2xl font-black mt-1 text-cyan-400">{fournisseurs.length}</h3>
                <p className="text-[10px] text-slate-500 mt-1">Partenaires actifs</p>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-blue-500/20 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-blue-500`}>
                <p className="text-xs text-slate-400 font-medium">Bons de commande</p>
                <h3 className="text-2xl font-black mt-1 text-blue-400">0</h3>
                <p className="text-[10px] text-slate-500 mt-1">Émis cette année</p>
              </Card>
              <Card className={`${isDarkMode ? 'bg-[#111827] border-indigo-500/20 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl border-l-4 border-l-indigo-500`}>
                <p className="text-xs text-slate-400 font-medium">Volume d'achats</p>
                <h3 className="text-2xl font-black mt-1 text-indigo-400">0,00 €</h3>
                <p className="text-[10px] text-slate-500 mt-1">Total approvisionnements</p>
              </Card>
            </div>

            {fournisseurs.length === 0 ? (
              <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-16 rounded-2xl shadow-xl text-center space-y-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <ShoppingCart className="w-8 h-8"/>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Aucun fournisseur répertorié</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Commencez par ajouter vos fournisseurs de matériel pour éditer vos bons de commande.</p>
                </div>
                <Button onClick={() => setModalFournisseurOuvert(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-extrabold text-xs h-10 px-6 rounded-xl shadow-lg shadow-cyan-500/30">
                  <Plus className="w-4 h-4 mr-2"/> Ajouter un fournisseur
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fournisseurs.map(f => (
                  <Card key={f.id} className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-5 rounded-2xl shadow-xl space-y-2`}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-cyan-400">{f.nom}</h4>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-semibold">{f.activite || 'Général'}</span>
                    </div>
                    <p className="text-xs text-slate-400">📧 {f.email || 'N/A'} • 📞 {f.telephone || 'N/A'}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
{/* MODULE FACTURATION & CRÉATION DE FACTURE HAUT EN COULEURS */}
        {vueActuelle === 'factures' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {!window.modeCreationFacture ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <Receipt className="w-7 h-7 text-emerald-400"/> Factures
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Gérez vos factures et encaissements en un clin d'œil</p>
                  </div>
                  <Button onClick={() => window.modeCreationFacture = true} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-xs h-10 px-5 rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2">
                    <Plus className="w-4 h-4"/> Nouvelle facture
                  </Button>
                </div>

                <div className={`${isDarkMode ? 'bg-[#111827]/80 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4`}>
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
                    <Input placeholder="Rechercher une facture ou client..." className={`h-10 pl-10 pr-4 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} rounded-xl text-xs w-full focus:border-emerald-500`} />
                  </div>
                  <div className="w-full md:w-48">
                    <select className={`h-10 px-4 w-full rounded-xl text-xs ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} border outline-none cursor-pointer focus:border-emerald-500 font-semibold text-emerald-400`}>
                      <option value="Toutes">🔍 Toutes</option>
                      <option value="Brouillons">📝 Brouillons</option>
                      <option value="Envoyées">📤 Envoyées</option>
                      <option value="Payées">✅ Payées</option>
                      <option value="En retard">⏳ En retard</option>
                      <option value="Annulées">❌ Annulées</option>
                    </select>
                  </div>
                </div>

                <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-12 rounded-2xl shadow-xl text-center space-y-4 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Receipt className="w-8 h-8"/>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Aucune facture</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">Créez votre première facture ou convertissez un devis accepté.</p>
                  </div>
                  <Button onClick={() => window.modeCreationFacture = true} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs h-10 px-6 rounded-xl shadow-lg shadow-emerald-900/30">
                    <Plus className="w-4 h-4 mr-2"/> Créer ma première facture
                  </Button>
                </Card>
              </div>
            ) : (
              /* FORMULAIRE DE CRÉATION DE FACTURE COLORÉ ET ULTRA-DESIGN */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => window.modeCreationFacture = false} className="bg-slate-800/50 border-slate-700 text-slate-200 h-9 text-xs">← Retour</Button>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-emerald-400"/> Nouvelle facture
                      </h2>
                      <p className="text-xs text-slate-400">Créez une facture professionnelle pour votre client</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bloc Facture d'acompte interactif */}
                    <Card className="bg-gradient-to-r from-emerald-950/30 via-[#111827] to-teal-950/25 border-emerald-500/40 p-5 rounded-2xl shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Euro className="w-5 h-5"/></div>
                          <div>
                            <h4 className="text-xs font-bold text-white">Facture d'acompte</h4>
                            <p className="text-[10px] text-slate-400">Créer une facture partielle basée sur un devis accepté</p>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          id="toggleAcompte"
                          onChange={(e) => {
                            const bloc = document.getElementById('detailsAcompte');
                            if (bloc) bloc.style.display = e.target.checked ? 'block' : 'none';
                          }}
                          className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                        />
                      </div>

                      <div id="detailsAcompte" style={{ display: 'none' }} className="pt-3 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Pourcentage de l'acompte</label>
                          <div className="flex gap-2">
                            {['30%', '40%', '50%', '60%', '70%'].map((pct, idx) => (
                              <button key={idx} type="button" className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${pct === '30%' ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-md shadow-emerald-900/40' : 'bg-[#0a0f1d] text-slate-300 border-slate-700 hover:border-emerald-500/50'}`}>{pct}</button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-white font-bold">Sélectionner un devis accepté</label>
                          <div className="p-3 bg-[#0a0f1d] border border-slate-800 rounded-xl text-xs text-slate-300">
                            Aucun devis accepté disponible. Créez d'abord un devis et faites-le accepter.
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Informations Générales */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-white">Informations générales</h3>
                        <p className="text-xs text-slate-400">Sélectionnez le client et les échéances</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-medium">Client</label>
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-400 text-xs">
                          <span>Aucun client trouvé. Créez votre premier client ci-dessous pour commencer.</span>
                        </div>
                        <div onClick={() => setModalNouveauClientOuvert(true)} className="border border-dashed border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer p-4 rounded-xl flex items-center gap-3 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">+</div>
                          <div>
                            <p className="text-xs font-bold text-emerald-400">Créer un nouveau client</p>
                            <p className="text-[10px] text-slate-400">Ajout rapide sans quitter la page</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Date de la facture</label>
                          <Input defaultValue="28/07/2026" className="bg-[#0a0f1d] border-slate-700 text-white h-10 text-xs mt-1"/>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Conditions de paiement</label>
                          <select className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                            <option>30 jours</option>
                            <option>15 jours</option>
                            <option>Paiement comptant</option>
                            <option>À réception</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Date d'échéance (calculée automatiquement)</label>
                          <Input defaultValue="27/08/2026" className="bg-[#0a0f1d] border-slate-700 text-slate-400 h-10 text-xs mt-1" disabled/>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Moyen de paiement (optionnel)</label>
                          <select className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                            <option>Virement bancaire</option>
                            <option>Carte bancaire</option>
                            <option>Chèque</option>
                            <option>Espèces</option>
                          </select>
                        </div>
                      </div>
                    </Card>

                    {/* Articles et prestations */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">Articles et prestations</h3>
                          <p className="text-xs text-slate-400">Ajoutez les lignes de la facture</p>
                        </div>
                        <Button onClick={() => alert("Ligne ajoutée !")} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs h-8 px-3 rounded-xl shadow-md">
                          <Plus className="w-3.5 h-3.5 mr-1"/> Ajouter une ligne
                        </Button>
                      </div>

                      <div className="space-y-4 bg-[#0a0f1d] p-4 rounded-xl border border-slate-800">
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Sélectionner un produit...</label>
                          <select className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                            <option>Sélectionner un produit...</option>
                            <option>Prestation électrique</option>
                            <option>Dépannage plomberie</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Description</label>
                          <Input placeholder="Ex: Prestation électrique" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Quantité</label>
                            <Input defaultValue="1" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Unité</label>
                            <Input defaultValue="unité" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">Prix unitaire HT</label>
                            <Input defaultValue="0" className="bg-[#111827] border-slate-700 text-white h-10 text-xs mt-1"/>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 font-medium">TVA</label>
                            <select className="w-full bg-[#111827] border border-slate-700 text-white rounded-xl px-3 h-10 text-xs mt-1 outline-none">
                              <option>20% - Taux normal</option>
                              <option>10% - Rénovation</option>
                              <option>5.5% - Énergétique</option>
                              <option>0% - Exonéré</option>
                            </select>
                          </div>
                        </div>
                        <div className="text-right text-xs text-emerald-400 font-semibold pt-2 border-t border-slate-800">
                          Total ligne : 0,00 € HT
                        </div>
                      </div>
                    </Card>

                    {/* Notes internes */}
                    <Card className="bg-[#111827] border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Notes</h3>
                        <p className="text-xs text-slate-400">Informations complémentaires</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-medium">Notes internes (facultatif)</label>
                        <textarea placeholder="Informations complémentaires, instructions particulières..." className="w-full bg-[#0a0f1d] border border-slate-700 text-white rounded-xl p-3 h-20 mt-1 outline-none resize-none text-xs"></textarea>
                      </div>
                    </Card>
                  </div>

                  {/* Panneau Récapitulatif Facture à droite */}
                  <div className="space-y-6">
                    <Card className="bg-[#111827] border-emerald-500/30 p-6 rounded-2xl shadow-xl space-y-5 sticky top-6">
                      <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Récapitulatif</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-400">Total HT</span><span className="font-bold text-white">0,00 €</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">TVA (20%)</span><span className="font-bold text-white">0,00 €</span></div>
                        <div className="flex justify-between text-sm pt-2 border-t border-slate-800"><span className="font-extrabold text-white">Total TTC</span><span className="font-black text-emerald-400 text-lg">0,00 €</span></div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Button onClick={() => { alert("Facture créée avec succès !"); window.modeCreationFacture = false; }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs h-11 rounded-xl shadow-lg shadow-emerald-900/30">
                          <Receipt className="w-4 h-4 mr-2"/> Créer la facture
                        </Button>
                        <Button variant="outline" onClick={() => window.modeCreationFacture = false} className="w-full bg-[#0a0f1d] border-slate-700 text-slate-300 hover:text-white text-xs h-10 rounded-xl">
                          Annuler
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {vueActuelle === 'chat' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight">Simulateur Assistant IA</h2>
            <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl flex flex-col h-[500px]`}>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl text-xs max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-500 text-slate-950 font-medium' : isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {iaReflechit && <div className="text-xs text-slate-400 italic">L'assistant réfléchit...</div>}
              </div>
              <form onSubmit={envoyerMessage} className="flex gap-2">
                <Input value={nouveauMessage} onChange={e => setNouveauMessage(e.target.value)} placeholder="Écrivez votre message à l'assistant..." className={`flex-1 ${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 text-xs`} />
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-10 px-4 text-xs"><Send className="w-4 h-4"/></Button>
              </form>
            </Card>
          </div>
        )}

        {vueActuelle === 'reglages' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight">Configuration de l'entreprise</h2>
            <Card className={`${isDarkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200'} p-6 rounded-2xl shadow-xl`}>
              <form onSubmit={sauvegarderProfil} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Nom de l'entreprise</label>
                  <Input value={profil.nom_entreprise} onChange={e => setProfil({...profil, nom_entreprise: e.target.value})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-medium">Tarif horaire (€)</label>
                    <Input type="number" value={profil.tarif_horaire} onChange={e => setProfil({...profil, tarif_horaire: Number(e.target.value)})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium">Tarif déplacement (€)</label>
                    <Input type="number" value={profil.tarif_deplacement} onChange={e => setProfil({...profil, tarif_deplacement: Number(e.target.value)})} className={`${isDarkMode ? 'bg-[#0a0f1d] border-slate-700 text-white' : 'bg-slate-50 border-slate-300'} h-10 mt-1`} />
                  </div>
                </div>
                {messageSauvegarde && <p className="text-emerald-400 font-semibold">{messageSauvegarde}</p>}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold h-10 px-5 text-xs"><Save className="w-4 h-4 mr-2"/> Enregistrer</Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
