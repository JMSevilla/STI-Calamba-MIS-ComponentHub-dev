import React, { useEffect, useState } from 'react'
import { Breadcrumb } from '../components/Breadcrumbs/BasicBreadCrumbs'
import { useLocation } from 'react-router-dom'
import { useApiCallback } from '../core/hooks/useApi'
import { useAvatarConfiguration } from '../core/hooks/useAvatarConfiguration'
import { Avatar, Chip, Grid, List, ListItem, ListItemAvatar, ListItemText, Typography, Pagination } from '@mui/material'
import BaseCard from '../components/Card/Card'
import DescriptionIcon from '@mui/icons-material/Description';
import moment from 'moment'

const ProfileDetails: React.FC = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const { stringAvatar, stringToColor } = useAvatarConfiguration()
    const accountId = queryParams.get('accountid')
    const [accountDetails, setAccountDetails] = useState([])
    const itemsPerPage = 4; // Number of items to display per page
    const [page, setPage] = useState(1);
    const [logger, setLogger] = useState([])
    const apiFetchAccountDetails = useApiCallback(
        async (api, accountId: any) => 
        await api.internal.accountProfileDetails(accountId)
    )
    const apiGetAccountsLogger = useApiCallback(
        async (api, id: any) => await api.internal.getAccountsLogger(id)
    )
    function initializedAccountDetails(){
        apiFetchAccountDetails.execute(accountId)
        .then((res) => {
            setAccountDetails(res.data)
        })
    }
    function initializedAccountsLogger(){
        apiGetAccountsLogger.execute(accountId)
        .then(res => {
            console.log(res.data)
            setLogger(res.data)
        })
    }
    const handleChangePage = (event: any, newPage: number) => {
        setPage(newPage);
      };
      const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    useEffect(() => {
        initializedAccountDetails()
        initializedAccountsLogger()
    }, [])
    return (
        <>
            <Breadcrumb pageName='Profile Details' />
            {
                accountDetails?.length > 0 && accountDetails.map((item: any) => (
                    <div className=' overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
                    <div className="relative z-20 h-35 md:h-65">
                        <img
                            src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpNZtxWICcs1w4Mt3EmP5TXwvpYgrRxabsLw&usqp=CAU'
                            alt="profile cover"
                            className="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
                        />
                    </div>
                    <div className="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
                        <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
                            <div className="relative drop-shadow-2">
                                    {
                                        item.imgurl == 'no-image' ?
                                        <Avatar {...stringAvatar(item.firstname + " " + item.lastname)} />
                                        :
                                        <>
                                         <Avatar
                                        src={item.imgurl}
                                        sx={{ width: 150, height: 150 }}
                                        />
                                        </>
                                    }
                            </div>
                            
                            
                        </div>
                        <div className='mt-4 h-screen'>
                                <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                                    {item.firstname + " " + item.lastname}
                                </h3>
                                <p className="font-medium">
                                    {item.access_level === 1 ? 'STI | System Administrator' : item.access_level === 2 ? 'STI | Professor' : 'STI | Student'}
                                </p>
                               <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid item xs={2}></Grid>
                                <Grid item xs={8}>
                                    <BaseCard>
                                        <Typography variant='button'>
                                            Basic Information
                                        </Typography>
                                        <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={6}>
                                                <Typography variant='caption'>
                                                    Email: {item.email}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                            <Typography variant='caption'>
                                                    Username: {item.username}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                        <Grid sx={{ mt: 2 }} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={6}>
                                                <Typography sx={{ mr: 1 }} variant='caption'>
                                                    Status:
                                                </Typography>
                                                {
                                                    item.status === 1 ?
                                                    <Chip size='small' variant='outlined' color='success' label='Account Active' />
                                                    :
                                                    <Chip size='small' variant='outlined' color='error' label='Account Disabled' />
                                                }
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography sx={{ mr: 1 }} variant='caption'>
                                                    Verified status:
                                                </Typography>
                                                {
                                                    item.verified === 1 ?
                                                    <Chip size='small' variant='outlined' color='success' label='Account Verified' />
                                                    :
                                                    <Chip size='small' variant='outlined' color='error' label='Account Not Verified' />
                                                }
                                            </Grid>
                                        </Grid>
                                    </BaseCard>
                                </Grid>
                                <Grid item xs={2}></Grid>
                               </Grid>
                               <BaseCard style={{ marginTop: '20px' }}>
                                                <Typography variant='button'>
                                                    Actions Logs
                                                </Typography> <br />
                                                {
                                                    logger?.length > 0 ?
                                                    (
                                                        <>
                                                            {logger.slice(startIndex, endIndex).map((logs: any, index) => (
                                                                <List>
                                                                <hr />
                                                                <ListItem>
                                                                    <ListItemAvatar>
                                                                        <Avatar>
                                                                            <DescriptionIcon />
                                                                        </Avatar>
                                                                    </ListItemAvatar>
                                                                    <ListItemText primary={logs.id} secondary={logs.actionsMessage + " " + moment(logs.created_at).calendar()} />
                                                                </ListItem>
                                                                <hr />
                                                            </List>
                                                            ))}
                                                            <Pagination
            count={Math.ceil(logger.length / itemsPerPage)}
            page={page}
            onChange={handleChangePage}
            variant="outlined"
            shape="rounded"
            size="large"
            style={{ marginTop: '20px' }}
          />
                                                        </>
                                                    )
                                                    :
                                                    <Typography variant='caption'>
                                                        No logs
                                                    </Typography>
                                                }
                                    </BaseCard>
                            </div>
                    </div>
                    
                </div>
                ))
            }
        </>
    )
}

export default ProfileDetails