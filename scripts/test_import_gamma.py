import importlib.util
import pathlib
import unittest
spec=importlib.util.spec_from_file_location('gamma_import',pathlib.Path(__file__).with_name('import-gamma-presentations.py'))
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
def document(cards):return {'content':{'type':'doc','content':[{'type':'document','content':cards}]}}
def card(nodes,hidden=False):return {'type':'card','attrs':{'hidden':hidden},'content':nodes}
class GammaImportTests(unittest.TestCase):
 def test_hidden_cards_are_not_imported(self):
  data=document([card([{'type':'paragraph','content':[{'type':'text','text':'Visible'}]}]),card([{'type':'paragraph','content':[{'type':'text','text':'Hidden'}]}],True)])
  out=module.extract(data);self.assertEqual(len(out['cards']),1);self.assertEqual(out['cards'][0]['blocks'][0]['text'],'Visible')
 def test_title_linebreaks_and_emoji_are_preserved(self):
  data=document([card([{'type':'title','attrs':{'level':1},'content':[{'type':'text','text':'A title'}]},{'type':'paragraph','content':[{'type':'text','text':'First'},{'type':'hardBreak'},{'type':'emoji','attrs':{'native':'🟢'}},{'type':'text','text':'Second'}]}])])
  blocks=module.extract(data)['cards'][0]['blocks'];self.assertEqual(blocks,[{'kind':'h1','text':'A title'},{'kind':'p','text':'First\n🟢Second'}])
 def test_diagram_steps_are_plain_text_in_source_order(self):
  data=document([card([{'type':'smartDiagram','attrs':{'data':{'step':[{'text':'<h4>Start &amp; pause</h4><p>A <strong>small</strong> action</p>'},{'text':'<h4>Continue</h4>'}]}}}])])
  self.assertEqual(module.extract(data)['cards'][0]['blocks'],[{'kind':'h4','text':'Start & pause'},{'kind':'p','text':'A small action'},{'kind':'h4','text':'Continue'}])
 def test_background_art_is_deduplicated(self):
  image={'src':'https://cdn.gamma.app/example.jpg','meta':{'width':1200,'height':800}}
  data=document([card([{'type':'image','attrs':image},{'type':'cardAccentLayoutItem','attrs':{'background':{'image':image}}}])])
  self.assertEqual(module.extract(data)['cards'][0]['images'],[{'url':image['src'],'width':1200,'height':800}])
 def test_unknown_root_fails_closed(self):
  with self.assertRaises(ValueError):module.extract({'content':{'content':[]}})
if __name__=='__main__':unittest.main()
