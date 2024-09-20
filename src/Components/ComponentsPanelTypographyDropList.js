import React from 'react'; 
import { Panel, Stack, Typography, DropList } from "@midasit-dev/moaui"; 

const ComponentsPanelTypographyDropList = ({ 
	title = "Generate load combination in:",
	items = new Map([
		['Steel Design', 1],
		['Concrete Design', 2],
		['SRC Design', 3],
		['Composite Steel Girder', 4]
	]),
}) => {
	const [values, setValues] = React.useState({
    selected: 1,
    items: items
  });

	return (
		<Panel width={280} height={40}  paddingLeft={0} paddingTop={1} variant='Box'>
			<Stack 
				direction="row" 
				spacing={0} 
				justifyContent="space-between" 
				alignItems="center"
			>
				<Typography width='220px'>{title}</Typography>
				<DropList 
					itemList={values.items} 
					width="150px" 
					defaultValue="Steel Design"
					value={values.selected}
					onChange={(e) => setValues({...values, selected: Number(e.target.value)})}
				/>
			</Stack>
		</Panel>
	);
}

export default ComponentsPanelTypographyDropList;
