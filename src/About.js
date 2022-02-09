import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';


export default function About({mobile}) {
  return (
    <Container sx={{ my: 2 }}>

      <Typography variant={mobile ? "h3" : "h1"} component="h1" gutterBottom>О проекте</Typography>

      <Alert severity="warning" sx={{mb: 2}}>
        Проект находится в стадии активной начальной разработки. Но, не смотря на это, уже сейчас мы будем рады вашей информации!
      </Alert>

      <Typography variant="body1" gutterBottom>
        Мы часто путешествуем с собаками, и постоянно сталкиваемся с проблемой поиска места для <em>проживания и питания</em>. Многие гостиницы не разрешают проживание с животными,
        в большинство ресторанов и кафе с ними нельзя. Даже, если заранее озаботиться поиском <em>проживания</em> в службах бронирования, пометка &laquo;можно с животными&raquo; часто
        на деле означает, что пускают только c маленькими ручными собачками.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Да и в родном городе иногда хочется с собакой не только в парке погулять, но и заглянуть в какое-нибудь приятное место, чтобы перекусить. Или зайти по пути домой в магазин,
        не бросая собаку на улице без присмотра.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Поэтому мы решили собрать <em>в одном месте все места</em>, куда #можноссобакой. Самый надёжный источник &mdash; это наши с вами отзывы. Делиться ими очень просто: добавьте
        на карту место и напишите, с каким питомцем и при каких обстоятельствах вы там побывали. Помимо этого мы собираем информацию, предоставленную владельцами бизнеса, и добавляем
        её <em>на карту</em>.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Мы только начинаем, впереди много планов &mdash; добавить разные способы поиска мест, предоставить владельцам возможность самостоятельно заявлять о себе, добавить возможность
        оставлять отзывы об уже имеющихся местах. И это только малая их часть.
      </Typography>

      <Typography variant="body1" gutterBottom>
        А ещё у проекта есть <Link href="https://instagram.com/mozhnossobakoi" target="_blank">инстаграм</Link>
        &nbsp;и <Link href="https://telegram.me/mozhnossobakoi" target="_blank">телеграм</Link>! Там мы скоро начнём публиковать новые интересные места, подписывайтесь!
      </Typography>

      <Typography variant="overline" component="div">
        <em>Искренне ваши</em>, Татьяна и Андрей
      </Typography>

      <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
        <Card sx={{ maxWidth: 400 }}>
          <CardMedia component="img" image="/family.jpg" alt="Наша семья с питомцами" />
        </Card>
      </Box>
    </Container>
  );
};