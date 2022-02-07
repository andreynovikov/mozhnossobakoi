import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';


export default function About() {
  return (
    <Container sx={{ my: 2 }}>

      <Typography variant="h1" gutterBottom>О проекте</Typography>

      <Alert severity="warning" sx={{mb: 2}}>
        Проект находится в стадии активной начальной разработки.
        Но, не смотря на это, уже сейчас мы будем рады вашей информации!
        Приносим извинения за временные неудобства.
      </Alert>

      <Typography variant="body1" gutterBottom>
        Когда путешествуешь с собаками, часто возникает проблема проживания и питания. Многие гостиницы не пускают с животными, в большинство ресторанов и кафе с ними нельзя.
        Даже, если заранее озаботиться поиском проживания в службах бронирования, пометка &laquo;можно с животными&raquo; часто на деле означает, что пускают только с животными,
        носимыми на руках.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Да и в родном городе иногда хочется с собакой не только погулять в парке, но и зайти в какое-нибудь приятное место, чтобы перекусить. Или зайти по пути домой в магазин,
        не бросая собаку на улице без присмотра.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Поэтому мы решили собрать <em>вместе все места</em>, куда #можноссобакой. Самый надёжный источник &mdash; это ваши отзывы. Делиться ими очень просто: добавьте на карту
        место и напишите, с каким питомцем и при каких обстоятельствах вы там побывали. Мы так-же собираем информацию, предоставленную владельцами бизнеса, и добавляем
        её <em>на карту</em>.
      </Typography>

      <Typography variant="body1" gutterBottom>
        Мы только начинаем, впереди много планов &mdash; добавить разные способы поиска мест, добавить владельцам возможность самостоятельно заявлять о себе, добавить возможность
        оставлять отзывы об уже имеющихся местах.
      </Typography>

      <Typography variant="body1">
        А ещё у нас есть <Link href="https://instagram.com/mozhnossobakoi" target="_blank">инстаграм</Link>
        &nbsp;и <Link href="https://telegram.me/mozhnossobakoi" target="_blank">телеграм</Link>! Там мы скоро начнём публиковать новые интересные места, подписывайтесь!
      </Typography>

    </Container>
  );
};
