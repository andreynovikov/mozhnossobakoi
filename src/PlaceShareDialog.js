import { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import {
    EmailShareButton,
    FacebookShareButton,
    LivejournalShareButton,
    MailruShareButton,
    OKShareButton,
    TelegramShareButton,
    TwitterShareButton,
    ViberShareButton,
    VKShareButton,
    WhatsappShareButton,
    EmailIcon,
    FacebookIcon,
    LivejournalIcon,
    MailruIcon,
    OKIcon,
    TelegramIcon,
    TwitterIcon,
    ViberIcon,
    VKIcon,
    WhatsappIcon
} from "react-share";

import punycode from 'punycode';


export default function PlaceShareDialog({place, open, onClose}) {
    const [shareUrl, setShareUrl] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        const origin = window.location.protocol + "//" + punycode.toUnicode(window.location.hostname) + (window.location.port ? ':' + window.location.port: '');
        setShareUrl(origin + '/places/' + place?.id);
        setTitle(place?.name);
    }, [place]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(function() {
            onClose();
        }, function() {
            console.log("Copy failure");
        });
    };

    return (
      <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
        <DialogContent>
          <Stack direction="column" spacing={1}>
            <Grid container spacing={0.5}>
              <Grid item>
                <Tooltip title="ВК" arrow>
                  <VKShareButton url={shareUrl}>
                    <VKIcon size={32} round />
                  </VKShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Одноклассники" arrow>
                  <OKShareButton url={shareUrl}>
                    <OKIcon size={32} round />
                  </OKShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Facebook" arrow>
                  <FacebookShareButton url={shareUrl} quote={title}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
               <Tooltip title="Telegram" arrow>
                  <TelegramShareButton url={shareUrl} title={title}>
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="WhatsApp" arrow>
                  <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Viber" arrow>
                  <ViberShareButton url={shareUrl} title={title}>
                    <ViberIcon size={32} round />
                  </ViberShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Twitter" arrow>
                  <TwitterShareButton url={shareUrl} title={title}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Живой журнал" arrow>
                  <LivejournalShareButton url={shareUrl} title={title} description={shareUrl}>
                    <LivejournalIcon size={32} round />
                  </LivejournalShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="Mail.ru" arrow>
                  <MailruShareButton url={shareUrl} title={title}>
                    <MailruIcon size={32} round />
                  </MailruShareButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title="На почту" arrow>
                  <EmailShareButton url={shareUrl} subject={title}>
                    <EmailIcon size={32} round />
                  </EmailShareButton>
                </Tooltip>
              </Grid>
            </Grid>
            <TextField defaultValue={shareUrl} size="small" margin="dense" InputProps={{readOnly: true}} />
            {navigator && navigator.clipboard && <Button variant="contained" size="small" onClick={handleCopy} sx={{width: 'fit-content'}}>
              Скопировать ссылку
            </Button>}
          </Stack>
        </DialogContent>
      </Dialog>
    );
}
