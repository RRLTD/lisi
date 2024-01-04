import React from 'react';
import { useNavigate } from "react-router-dom";

import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import CircularProgress from '@mui/joy/CircularProgress';
import Alert from '@mui/joy/Alert';
import Typography from '@mui/joy/Typography';
import Grid from '@mui/joy/Grid';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Divider from '@mui/joy/Divider';

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [user, setUser] = React.useState();
    const [songs, setSongs] = React.useState([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/auth/login');
        fetch('http://172.20.10.3:3000/auth/me', {
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            method: 'GET'
        })
            .then(res => res.json())
            .then(json => {
                if (json.error) {
                    navigate('/auth/login')
                } else {
                    if (json.user) {
                        setUser(json.user);
                        fetch('http://172.20.10.3:3000/songs', {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: token,
                            },
                            method: 'GET'
                        })
                            .then(res => res.json())
                            .then(json => {
                                if (json.error) {
                                    setError('The backend returned an error, please contact a website administrator. Error: ' + json.error);
                                    setIsLoading(false);
                                } else {
                                    if (json.songs) {
                                        setSongs(json.songs);
                                        setIsLoading(false);
                                    } else {
                                        setError('The backend did not return any songs or an error, please contact a website administrator.');
                                        setIsLoading(false);
                                    }
                                }
                            })
                            .catch(e => {
                                setError("There was an error contacting the backend, please contact a website administrator");
                                setIsLoading(false);
                            })
                    } else {
                        setError('The backend did not return a user or an error, please contact a website administrator.');
                        setIsLoading(false);
                    }
                }
            })
            .catch(e => {
                setError("There was an error contacting the backend, please contact a website administrator");
                setIsLoading(false);
            })
    }, [])

    return (
        isLoading
            ?
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", height: "100%" }}>
                <CircularProgress />
            </Box>
            :
            error
                ?
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", height: "100%" }}>
                    <Alert color="danger" variant="soft" sx={{ display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                        {error}
                    </Alert>
                </Box>
                :
                <Box sx={{ height: "100%" }}>
                    <Box sx={{ p: 4 }}>
                        <Breadcrumbs aria-label="breadcrumbs">
                            <Box style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--variant-plainColor, rgba(var(--joy-palette-neutral-mainChannel) / 1))", fontSize: "14px" }}>
                                <DashboardRoundedIcon />
                                <Typography>Dashboard</Typography>
                            </Box>
                        </Breadcrumbs>
                        <Typography level="h2">
                            Welcome back {user.firstName}!
                        </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={2} sx={{ justifyContent: "center" }}>
                            {songs.map(song =>
                                <Grid item key={JSON.stringify(song)} sx={{ width: 500 }}>
                                    <Card sx={{ display: 'flex', flexDirection: 'column', p: 2, gap: 2 }}>
                                        <Sheet sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 4 }}>
                                            <Sheet>
                                                <Typography level="h4">
                                                    {song.name}
                                                </Typography>
                                                <Typography level="body-sm">
                                                    {song.artist}
                                                </Typography>
                                            </Sheet>
                                            <img height={70} src={`https://media.learnitsignit.co.uk/${song._id}/cover.jpeg`} style={{ borderRadius: '0.25rem' }} />
                                        </Sheet>
                                        <Button variant="outlined" sx={{ width: "fit-content" }} onClick={() => navigate(`/dashboard/song/${song._id}`)}>
                                            Play Song
                                        </Button>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Box>
    )
}