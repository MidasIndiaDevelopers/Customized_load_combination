import React from 'react'; 
import { Dialog, Button, Typography, Stack, IconButton, Icon,Table,TableHead,TableRow,TableCell,TableBody,Paper} from "@midasit-dev/moaui";

const ComponentsDialogHelpIconButton = () => {
	const [open, setOpen] = React.useState(false);

	const HelpDialog = (props) => {
		// return (
		// 	<Dialog
		// 		open={props.open}
		// 		onClose={() => props.setOpen(false)}
		// 	>
		// 		<Typography variant="h1" component="div" style={{ padding: '16px' }}>
		// 			Customized Load Combination Auto Generator
		// 		</Typography>
		// 		<div style={{ margin: '16px', padding: '16px', border: '1px solid #ccc', borderRadius: '4px' }}>
		// 			<Table>
		// 				<TableHead>
		// 					<TableRow>
		// 						<TableCell><strong>Category</strong></TableCell>
		// 						<TableCell><strong>Action</strong></TableCell>
		// 						<TableCell><strong>Description</strong></TableCell>
		// 					</TableRow>
		// 				</TableHead>
		// 				<TableBody>
		// 					{/* Active Section */}
		// 					<TableRow>
		// 						<TableCell rowSpan={4}><strong>Active</strong></TableCell>
		// 						<TableCell>Local</TableCell>
		// 						<TableCell>Only visible in Plug-in</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>Inactive</TableCell>
		// 						<TableCell>May be created in Civil if user selects</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>Strength</TableCell>
		// 						<TableCell>Will be created in Civil & designed for ULS</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>Service</TableCell>
		// 						<TableCell>Will be created in Civil & designed for SLS</TableCell>
		// 					</TableRow>
	
		// 					{/* Type Section */}
		// 					<TableRow>
		// 						<TableCell rowSpan={3}><strong>Type</strong></TableCell>
		// 						<TableCell>Add</TableCell>
		// 						<TableCell>Add all the cases in one combination</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>Either</TableCell>
		// 						<TableCell>Consider only one of the cases in one combination</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>Envelop</TableCell>
		// 						<TableCell>Make an envelop of cases in the combination</TableCell>
		// 					</TableRow>
	
		// 					{/* Sign Section */}
		// 					<TableRow>
		// 						<TableCell rowSpan={4}><strong>Sign</strong></TableCell>
		// 						<TableCell>+</TableCell>
		// 						<TableCell>Only positive values of factor</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>-</TableCell>
		// 						<TableCell>Only negative values of factor</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>±</TableCell>
		// 						<TableCell>Permutation of positive and negative factors</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell>+, -</TableCell>
		// 						<TableCell>All only positive and only negative factors</TableCell>
		// 					</TableRow>
	
		// 					{/* Additional Rows */}
		// 					<TableRow>
		// 						<TableCell><strong>Load Cases</strong></TableCell>
		// 						<TableCell colSpan={2}>
		// 							Imported as generated in Civil in drop down menu.<br />
		// 							List updated to include defined combo in plug-in (e.g., Static, RS, MVL, TH, Settlement, etc.)
		// 						</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Load Combination</strong></TableCell>
		// 						<TableCell colSpan={2}>Name to be entered by the client</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Factor 1 to 5</strong></TableCell>
		// 						<TableCell colSpan={2}>
		// 							Values (only) to be entered by the client. It may be blank for combination. At least 1 factor is required for an imported load case.<br />
		// 							All factor 1 values in one load combination will be used concurrently. Example: Tendon Primary with factor 1 (1.1) can't be combined with Tendon Secondary Factor 2 (0.9).<br />
		// 							However, Tendon Primary Factor 1 (1.1) and Tendon Secondary Factor 1 (1.1) can be combined with other load cases, e.g., DL+SIDL Factor 2 (1).
		// 						</TableCell>
		// 					</TableRow>
							
		// 					{/* Additional Guidelines */}
		// 					<TableRow>
		// 						<TableCell><strong>Generate envelop load combinations in midas</strong></TableCell>
		// 						<TableCell colSpan={2}>Will generate envelop of generated combinations</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Generate inactive load combinations in midas</strong></TableCell>
		// 						<TableCell colSpan={2}>Will generate load combinations that are "Inactive"</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Generate load combinations in:</strong></TableCell>
		// 						<TableCell colSpan={2}>
		// 							Select tab in which combinations will be generated.<br />
		// 							Options: Steel Design, Concrete Design, SRC Design, Composite Steel Girder Design
		// 						</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Import Load Cases</strong></TableCell>
		// 						<TableCell colSpan={2}>
		// 							Import load cases based on generated model (e.g., Static, RS, MVL, TH, Settlement, etc.)
		// 						</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Export Load Combination Input</strong></TableCell>
		// 						<TableCell colSpan={2}>
		// 							Export wizard file to use with other models.<br />
		// 							Useful for generating templates for specific design codes (like TMH, AREMA).<br />
		// 							Also helpful for regenerating load combinations in Civil NX in case of errors.
		// 						</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Import Load Combination Input</strong></TableCell>
		// 						<TableCell colSpan={2}>To import the generated wizard file</TableCell>
		// 					</TableRow>
		// 					<TableRow>
		// 						<TableCell><strong>Generate Load Combinations</strong></TableCell>
		// 						<TableCell colSpan={2}>Generates load combinations in midas Civil NX</TableCell>
		// 					</TableRow>
		// 				</TableBody>
		// 			</Table>
		// 		</div>
		// 	</Dialog>
		// );
	}

	return (
		<>
			<IconButton transparent onClick={() => setOpen(true)}>
				<Icon iconName="Help" />
			</IconButton>
			<HelpDialog open={open} setOpen={setOpen} />
		</>
	)
}

export default ComponentsDialogHelpIconButton;