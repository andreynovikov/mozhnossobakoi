import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import ReactGA from 'react-ga4';

import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { useDocumentTitle } from './hooks';


export default function Help({mobile}) {
    useDocumentTitle('Помощь');
    const location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search, title: 'О проекте' });
    }, []);

    return (
      <Container sx={{ my: 2 }}>

        <Typography variant={mobile ? "h3" : "h1"} component="h1" gutterBottom>Помощь</Typography>

        <Typography variant="h5" gutterBottom>Как мне поделиться местом?</Typography>

        <Typography variant="body1" gutterBottom>
          Найдите на карте, где находится это место, и нажмите на кнопку <Typography variant="overline">&laquo;Добавить место&raquo;</Typography>.
          На карте появится маркер, его нужно перетащить как можно точнее в нужную позицию.
          Не беда, если не помните, где оно точно, мы потом это поправим. Укажите название места и его тип. Опишите, с какой собакой вы там побывали. Это важно, так как во многие места
          можно попасть далеко не с любой породой и размером питомца. Опишите, как отнеслись к вашему питомцу, были ли какие-нибудь дополнительные условия и издержки. Постарайтесь
          вспомнить и указать, когда примерно вы там были. Если это было давно, есть вероятность, что что-то поменялось. Всё остальное мы сделаем сами: найдём информацию об этом месте,
          уточним местоположение и формальные условия посещения с питомцами.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Как быть, если я не могу найти место на карте?</Typography>

        <Typography variant="body1" gutterBottom>
          Ничего страшного, просто напишите в описании подробнее, где находится это место &mdash; город, улицу, какие-то другие ориентиры, и мы постараемся его найти. А может вы знаете
          их телефон, это тоже поможет.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>А можно ещё проще?</Typography>

        <Typography variant="body1" gutterBottom>
          Можно! Просто добавьте тег <Typography variant="overline">#можноссобакой</Typography> к вашему рассказу об этом месте в инстаграм, и мы его увидим.
          А если не хотите о нём рассказывать, напишите нам в директ.
          Ещё у нас есть телеграм бот <Link href="https://telegram.me/mozhnossobakoi_bot" target="_blank">@mozhnossobakoi_bot</Link>, ему тоже можно сообщить о найденном месте.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Как мне найти нужное место?</Typography>

        <Typography variant="body1" gutterBottom>
          Проще всего посмотреть на карте. Для удобства, вверху карты есть поле для поиска по адресу, к сожалению только российскому. Пока на карте показываются все места без разбора,
          но уже скоро там появятся фильтры по типу места. Можно воспользоваться списком мест. Там тоже перечислены все места, но в ближайшее время мы добавим поиск по городам, чтобы
          в нём было проще ориентироваться.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Я хозяин заведения, как я могу добавить его на карту?</Typography>

        <Typography variant="body1" gutterBottom>
          В будущем мы планируем сделать для этого специальную кнопку, а пока вы можете сделать это обычным способом, только укажите в описании, что вы владелец, а не посетитель.
        </Typography>

      </Container>
    );
};
