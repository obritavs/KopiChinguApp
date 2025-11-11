import { IonPage, IonContent, IonText, IonList, IonItem, IonLabel, IonThumbnail, IonIcon } from '@ionic/react';
import { logoGithub, mailOutline } from 'ionicons/icons';
import React from 'react';
import Header from '../components/Header';
import './Developers.css'; 

const developers = [
    {
        name: 'Mark Noe Mondejar',
        role: 'Project Manager',
        githubUrl: 'https://github.com/MarkNoe',
        imageUrl: '/assets/images/mark_noe.jpg',
    },
    {
        name: 'Ace Daniel Panesa',
        role: 'Frontend Developer (React/Ionic)',
        githubUrl: 'https://github.com/AceDaniel',
        imageUrl: '/assets/images/ace_daniel.jpg',
    },
    {
        name: 'Gerimiah Josh Palma',
        role: 'Lead Backend Developer (Firebase)',
        githubUrl: 'https://github.com/gjbp10',
        imageUrl: '/assets/images/gerimiah_josh.jpg',
    },
    {
        name: 'Aubrey Tavu',
        role: 'Lead Frontend Developer (React/Ionic)',
        githubUrl: 'https://github.com/obritavs',
        imageUrl: '/assets/images/aubrey_tavu.jpg',
    },
    {
        name: 'Jairus Torreda',
        role: 'Quality Assurance & Testing',
        githubUrl: 'https://github.com/JairusTorreda',
        imageUrl: '/assets/images/jairus_torreda.jpg',
    },
];
// ---------------------------------------------------

const Developers: React.FC = () => {
    return (
        <IonPage>
            <Header title="Developers" />
            <IonContent className="ion-padding">
                <IonText className="ion-padding-horizontal">
                    <h2>Meet the Team</h2>
                    <p>
                        This application was developed as a collaborative project to deliver a modern, efficient, and user-friendly mobile ordering platform.
                    </p>
                </IonText>

                <IonList className="dev-list"> 
                    {developers.map((dev) => (
                        <IonItem key={dev.name} detail={false} className="dev-item"> 
                           
                            <IonThumbnail slot="start" className="dev-thumbnail">
                                <img 
                                    alt={`${dev.name}'s Profile`} 
                                    src={dev.imageUrl} 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://ionicframework.com/docs/img/demos/avatar.svg';
                                    }}
                                />
                            </IonThumbnail>
                            
                            <IonLabel>
                                <h3>{dev.name}</h3>
                                <p>{dev.role}</p>
                              
                                <a 
                                    href={dev.githubUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="github-link" 
                                >
                                    <IonIcon icon={logoGithub} slot="start" /> View GitHub
                                </a>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>
        </IonPage>
    );
};

export default Developers;
